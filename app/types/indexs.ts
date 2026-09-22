import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  transactionId: number;
  txRef: string;
  amount: number;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }

  try {
    const secretKey = Deno.env.get("FLW_SECRET_KEY");

    if (!secretKey) {
      return json(
        { message: "FLW_SECRET_KEY is not configured on the server." },
        500,
      );
    }

    const body = (await req.json()) as Partial<RequestBody>;
    const transactionId = Number(body.transactionId);
    const txRef = String(body.txRef || "");
    const expectedAmount = Number(body.amount);

    if (!Number.isFinite(transactionId) || transactionId <= 0) {
      return json({ message: "Invalid Flutterwave transaction ID." }, 400);
    }

    if (!txRef) {
      return json({ message: "Missing transaction reference." }, 400);
    }

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return json({ message: "Invalid expected payment amount." }, 400);
    }

    const flutterwaveResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const flutterwavePayload = await flutterwaveResponse.json();

    if (!flutterwaveResponse.ok) {
      return json(
        {
          verified: false,
          message:
            flutterwavePayload?.message ||
            "Flutterwave rejected the verification request.",
        },
        400,
      );
    }

    const transaction = flutterwavePayload?.data;

    if (!transaction) {
      return json(
        { verified: false, message: "No transaction data was returned." },
        400,
      );
    }

    const statusIsSuccessful = transaction.status === "successful";
    const referenceMatches = transaction.tx_ref === txRef;
    const currencyMatches = transaction.currency === "NGN";
    const amountMatches = Number(transaction.amount) >= expectedAmount;

    if (
      !statusIsSuccessful ||
      !referenceMatches ||
      !currencyMatches ||
      !amountMatches
    ) {
      return json(
        {
          verified: false,
          message: "Payment was returned by Flutterwave but did not pass verification.",
        },
        400,
      );
    }

    return json({
      verified: true,
      transaction: {
        id: transaction.id,
        tx_ref: transaction.tx_ref,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        status: transaction.status,
        payment_type: transaction.payment_type,
        flw_ref: transaction.flw_ref,
      },
    });
  } catch (error) {
    console.error("verify-flutterwave-payment error:", error);

    return json(
      {
        verified: false,
        message: "Unable to verify the Flutterwave transaction right now.",
      },
      500,
    );
  }
});
