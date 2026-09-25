import { useEffect, useMemo, useState } from "react";
import { getProfile } from "../data/profileStore";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveCheckoutConfig) => {
      close: () => void;
    };
  }
}

interface FlutterwaveCheckoutConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: "NGN";
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
  };
  configurations?: {
    session_duration?: number;
    max_retry_attempt?: number;
  };
  bank_transfer_options?: {
    expires?: number;
  };
  meta?: Record<string, string>;
  callback: (response: FlutterwaveCallbackResponse) => void;
  onclose: () => void;
}

interface FlutterwaveCallbackResponse {
  status: string;
  tx_ref: string;
  transaction_id?: number;
  id?: number;
  amount?: number;
  currency?: string;
}

interface VerifyResponse {
  verified: boolean;
  message?: string;
  transaction?: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
    payment_type?: string;
    flw_ref?: string;
  };
}

interface FlutterwaveCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amountNaira: number;
  driverName?: string;
  driverVehicle?: string;
  driverBank?: string;
  driverAccount?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  onPaymentSuccess?: (ref: string, amount: number) => void;
}

type FLWChannel = "card" | "transfer" | "ussd" | "mobilemoney";
type CheckoutStep = "checkout" | "processing" | "success";

function generateTxRef(): string {
  return `RUN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
}

function getPaymentOption(channel: FLWChannel): string {
  switch (channel) {
    case "card":
      return "card";
    case "transfer":
      return "banktransfer";
    case "ussd":
      return "ussd";
    case "mobilemoney":
      return "opay";
  }
}

async function loadFlutterwaveScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (typeof window.FlutterwaveCheckout === "function") return;

  const existingScript = document.querySelector(
    'script[src="https://checkout.flutterwave.com/v3.js"]',
  );

  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => {
          window.clearInterval(check);
          reject(new Error("Flutterwave script load timed out."));
        },
        10000,
      );

      const check = window.setInterval(() => {
        if (typeof window.FlutterwaveCheckout === "function") {
          window.clearTimeout(timeout);
          window.clearInterval(check);
          resolve();
        }
      }, 100);
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.FlutterwaveCheckout === "function") {
        resolve();
      } else {
        reject(new Error("Flutterwave loaded without exposing checkout."));
      }
    };

    script.onerror = () =>
      reject(new Error("Unable to load Flutterwave Checkout."));

    document.head.appendChild(script);
  });
}

async function verifyFlutterwavePayment(
  transactionId: number,
  txRef: string,
  amountNaira: number,
): Promise<VerifyResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_KEY
  ) as string | undefined;

  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL is missing from your .env file.");
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is missing from your .env file.",
    );
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/verify-flutterwave-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        transactionId,
        txRef,
        amount: amountNaira,
      }),
    },
  );

  let payload: VerifyResponse | { message?: string } = {};

  try {
    payload = await response.json();
  } catch {
    throw new Error("Payment verification returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      "message" in payload && payload.message
        ? payload.message
        : "The payment could not be verified.",
    );
  }

  return payload as VerifyResponse;
}

export default function FlutterwaveCheckout({
  isOpen,
  onClose,
  amountNaira,
  driverName = "Mr. Michael",
  driverVehicle = "School Sedan",
  driverBank = "Opay",
  driverAccount = "7049593176",
  pickupLocation = "Main Hostel Prophet Moses",
  dropoffLocation = "Library Block",
  onPaymentSuccess,
}: FlutterwaveCheckoutProps) {
  const profile = getProfile();

  const [channel, setChannel] = useState<FLWChannel>("card");
  const [step, setStep] = useState<CheckoutStep>("checkout");
  const [txRef, setTxRef] = useState(generateTxRef);
  const [flwReady, setFlwReady] = useState(false);
  const [error, setError] = useState("");
  const [verifiedTransactionId, setVerifiedTransactionId] = useState<number>();
  const [verifiedReference, setVerifiedReference] = useState("");
  const [verifiedPaymentType, setVerifiedPaymentType] = useState("");
  const [verifiedAt, setVerifiedAt] = useState("");

  const CHANNELS: { id: FLWChannel; label: string; icon: string }[] = [
    { id: "card", label: "Card", icon: "💳" },
    { id: "transfer", label: "Transfer", icon: "🏦" },
    { id: "ussd", label: "USSD", icon: "📱" },
    { id: "mobilemoney", label: "OPay", icon: "🟢" },
  ];

  const paymentOption = useMemo(() => getPaymentOption(channel), [channel]);

  useEffect(() => {
    if (!isOpen) return;

    setStep("checkout");
    setError("");
    setFlwReady(false);
    setVerifiedTransactionId(undefined);
    setVerifiedReference("");
    setVerifiedPaymentType("");
    setVerifiedAt("");
    setTxRef(generateTxRef());

    let cancelled = false;

    loadFlutterwaveScript()
      .then(() => {
        if (!cancelled) setFlwReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Flutterwave could not be loaded.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const openFlwPopup = () => {
    if (typeof window.FlutterwaveCheckout !== "function") {
      setError("Flutterwave is still loading. Please try again in a moment.");
      return;
    }

    const publicKey = import.meta.env.VITE_FLW_PUBLIC_KEY as
      | string
      | undefined;

    if (!publicKey) {
      setError("VITE_FLW_PUBLIC_KEY is missing from your .env file.");
      return;
    }

    setError("");
    setStep("processing");

    window.FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: txRef,
      amount: amountNaira,
      currency: "NGN",
      payment_options: paymentOption,
      customer: {
        email: profile.name
          ? `${profile.name.toLowerCase().replace(/\s+/g, ".")}@run.edu.ng`
          : "student@run.edu.ng",
        phone_number: profile.phone || "08000000000",
        name: profile.name || "RUN Student",
      },
      customizations: {
        title: "RUN Transport Campus Fare",
        description: `${pickupLocation} → ${dropoffLocation} | ${driverVehicle}`,
      },
      configurations: {
        // Keep the Flutterwave checkout session alive for 60 minutes.
        session_duration: 60,
        max_retry_attempt: 5,
      },
      // Give the generated bank-transfer account 60 minutes before it expires.
      // Flutterwave expects this value in seconds.
      bank_transfer_options: {
        expires: 60 * 60,
      },
      meta: {
        driver_name: driverName,
        driver_vehicle: driverVehicle,
        pickup: pickupLocation,
        dropoff: dropoffLocation,
      },
      callback: async (response) => {
        const transactionId = response.transaction_id ?? response.id;

        if (
          response.status !== "successful" &&
          response.status !== "completed"
        ) {
          setStep("checkout");
          setError(
            "Flutterwave did not report a successful payment. No ride payment was confirmed.",
          );
          return;
        }

        if (!transactionId) {
          setStep("checkout");
          setError(
            "Flutterwave returned no transaction ID, so the payment cannot be verified yet.",
          );
          return;
        }

        try {
          const verification = await verifyFlutterwavePayment(
            transactionId,
            response.tx_ref,
            amountNaira,
          );

          if (!verification.verified || !verification.transaction) {
            setStep("checkout");
            setError(
              verification.message ||
                "Payment verification failed. Nothing has been confirmed.",
            );
            return;
          }

          setVerifiedTransactionId(verification.transaction.id);
          setVerifiedReference(verification.transaction.tx_ref);
          setVerifiedPaymentType(
            verification.transaction.payment_type || paymentOption,
          );
          setVerifiedAt(new Date().toLocaleTimeString());
          setStep("success");

          onPaymentSuccess?.(
            verification.transaction.tx_ref,
            verification.transaction.amount,
          );
        } catch (err: unknown) {
          console.error("Flutterwave verification error:", err);
          setStep("checkout");
          setError(
            err instanceof Error
              ? err.message
              : "The payment could not be verified. Please try again.",
          );
        }
      },
      onclose: () => {
        // Closing the popup is never treated as a successful payment.
        // Verification above is the only path that can reach the success screen.
        setStep((current) => (current === "success" ? current : "checkout"));
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border text-white shadow-2xl"
        style={{
          background: "#060e1c",
          borderColor: "rgba(255, 106, 0, 0.35)",
        }}
      >
        <div
          className="flex items-center justify-between border-b p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,106,0,0.12) 0%, rgba(255,180,0,0.08) 100%)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FF6A00, #FFB400)",
              }}
            >
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span>Flutterwave Checkout</span>
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                  Secure
                </span>
              </div>
              <div className="text-[11px] text-gray-400">
                Redeemer&apos;s University Campus Transit Fare
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all hover:bg-white/20 hover:text-white"
            aria-label="Close payment"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-6 py-4">
          <div>
            <span className="block text-xs text-gray-400">Total Fare</span>
            <span className="text-2xl font-black" style={{ color: "#FF6A00" }}>
              ₦{amountNaira.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-xs text-gray-400">{driverName}</span>
            <span className="text-xs font-medium text-orange-400">
              {driverVehicle}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "checkout" && (
            <div>
              <div className="mb-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <p className="text-xs leading-5 text-gray-300">
                  Your payment will open in Flutterwave&apos;s secure checkout.
                  RUN Transport will only mark this ride as paid after the
                  transaction is verified on the server.
                </p>
              </div>

              <div className="mb-5 grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-black/50 p-1">
                {CHANNELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setChannel(item.id);
                      setError("");
                    }}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                      channel === item.id
                        ? "text-white shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                    style={
                      channel === item.id
                        ? {
                            background:
                              "linear-gradient(135deg, #FF6A00, #e05c00)",
                          }
                        : undefined
                    }
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-1 text-xs font-semibold text-white">
                  Selected method: {CHANNELS.find((item) => item.id === channel)?.label}
                </div>
                <p className="text-[11px] leading-5 text-gray-400">
                  {channel === "card" &&
                    "Enter your card details inside the official Flutterwave checkout."}
                  {channel === "transfer" &&
                    "Flutterwave will provide the supported bank-transfer flow inside its checkout."}
                  {channel === "ussd" &&
                    "Flutterwave will show the available USSD payment flow for the transaction."}
                  {channel === "mobilemoney" &&
                    `Flutterwave will handle the OPay payment flow. Do not send money directly to a driver's personal account.`}
                </p>
              </div>

              <button
                type="button"
                onClick={openFlwPopup}
                disabled={!flwReady}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00, #FFB400)",
                  boxShadow: "0 4px 20px rgba(255,106,0,0.35)",
                }}
              >
                <span>⚡</span>
                <span>
                  {flwReady
                    ? `Pay ₦${amountNaira.toLocaleString()} with Flutterwave`
                    : "Loading Flutterwave…"}
                </span>
              </button>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-300">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === "processing" && (
            <div className="space-y-4 py-10 text-center">
              <div
                className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-transparent"
                style={{ borderTopColor: "#FF6A00" }}
              />
              <div className="text-base font-bold text-white">
                Verifying payment…
              </div>
              <p className="text-xs leading-5 text-gray-400">
                Do not close this window until RUN Transport confirms the
                Flutterwave transaction.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 py-4 text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{
                  background: "rgba(255,106,0,0.15)",
                  border: "1px solid rgba(255,106,0,0.35)",
                }}
              >
                ✓
              </div>

              <h3 className="text-lg font-extrabold text-white">
                Payment Confirmed! 🎉
              </h3>

              <p className="text-xs text-gray-300">
                Flutterwave verified the fare of{" "}
                <strong style={{ color: "#FF6A00" }}>
                  ₦{amountNaira.toLocaleString()}
                </strong>
                .
              </p>

              <div
                className="space-y-2 rounded-2xl border p-4 text-left text-xs"
                style={{
                  background: "rgba(255,106,0,0.06)",
                  borderColor: "rgba(255,106,0,0.2)",
                }}
              >
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">FLW Ref:</span>
                  <span className="break-all text-right font-mono text-orange-400 text-[11px]">
                    {verifiedReference || txRef}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="text-white">{verifiedTransactionId ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Payment:</span>
                  <span className="capitalize text-white">
                    {verifiedPaymentType || paymentOption}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Driver:</span>
                  <span className="text-right text-white">
                    {driverName} ({driverVehicle})
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Route:</span>
                  <span className="max-w-[210px] truncate text-right text-white">
                    {pickupLocation} → {dropoffLocation}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Verified:</span>
                  <span className="text-white">{verifiedAt || "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Driver Bank:</span>
                  <span className="text-right text-white">
                    {driverBank} · {driverAccount}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00, #FFB400)",
                  boxShadow: "0 4px 16px rgba(255,106,0,0.3)",
                }}
              >
                Done · Return to Home
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-white/5 bg-black/60 p-3 text-[11px] text-gray-400">
          <span>🔒</span>
          <span>
            Secured by <strong style={{ color: "#FF6A00" }}>Flutterwave</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
