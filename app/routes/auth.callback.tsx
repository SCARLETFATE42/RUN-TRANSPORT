import { useEffect } from "react";
import { data, Link, useNavigate } from "react-router";
import type { Route } from "./+types/auth.callback";
import {
  getPostAuthRedirectPath,
  syncProfileFromSupabaseUser,
} from "~/data/profileStore";
import { createClient as createServerClient } from "~/utils/supabase.server";
import RUNLogo from "./runlogo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Finishing sign in | RideCampus" },
    {
      name: "description",
      content: "Completing your Supabase authentication session.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const callbackUrl = new URL(request.url);
  const providerError =
    callbackUrl.searchParams.get("error_description") ??
    callbackUrl.searchParams.get("error");

  if (providerError) {
    return data(
      { authUser: null, errorMessage: providerError },
      { status: 400 },
    );
  }

  const code = callbackUrl.searchParams.get("code");

  if (!code) {
    return data(
      {
        authUser: null,
        errorMessage: "No authorization code was returned from the provider.",
      },
      { status: 400 },
    );
  }

  const { supabase, headers } = createServerClient(request);
  const { data: existingUserData } = await supabase.auth.getUser();

  if (existingUserData.user) {
    return data(
      { authUser: existingUserData.user, errorMessage: "" },
      { headers },
    );
  }

  const flowId = callbackUrl.searchParams.get("sb_flow_id");
  const { data: authData, error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error) {
    return data(
      { authUser: null, errorMessage: error.message },
      { status: 400, headers },
    );
  }

  return data(
    { authUser: authData.user, errorMessage: "" },
    { headers },
  );
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export default function AuthCallback({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { authUser, errorMessage } = loaderData;

  useEffect(() => {
    if (!authUser) return;

    const profile = syncProfileFromSupabaseUser(authUser);
    navigate(getPostAuthRedirectPath(profile), { replace: true });
  }, [authUser, navigate]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      <div
        className="glass w-full max-w-sm rounded-3xl p-8 text-center"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div className="mb-5 flex justify-center">
          <RUNLogo size={74} showText={true} />
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">
          {errorMessage ? "Sign in needs attention" : "Finishing sign in"}
        </h1>
        <p className="text-sm leading-6" style={{ color: "var(--color-muted)" }}>
          {errorMessage ||
            "Please wait while Supabase finishes your secure session."}
        </p>
        {errorMessage && (
          <Link
            to="/AuthScreen"
            className="mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--color-primary)" }}
          >
            Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
