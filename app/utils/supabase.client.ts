import { createBrowserClient } from "@supabase/ssr";

const AUTH_CALLBACK_PATH = "/auth/callback";
const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_SUPABASE_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY
  ) as string | undefined;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in the environment.",
    );
  }

  return { supabaseUrl, supabaseKey };
}

function isLocalHostname(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();

  return (
    LOCAL_HOSTNAMES.has(normalizedHostname) ||
    normalizedHostname.endsWith(".localhost")
  );
}

export function getAuthCallbackUrl() {
  const configuredUrl = import.meta.env.VITE_AUTH_REDIRECT_URL as
    | string
    | undefined;
  const trimmedUrl = configuredUrl?.trim();

  if (typeof window === "undefined") return trimmedUrl || AUTH_CALLBACK_PATH;

  const currentOriginCallbackUrl = `${window.location.origin}${AUTH_CALLBACK_PATH}`;

  if (!trimmedUrl) return currentOriginCallbackUrl;

  try {
    const parsedConfiguredUrl = new URL(trimmedUrl, window.location.origin);
    const isConfiguredForLocalDev = isLocalHostname(
      parsedConfiguredUrl.hostname,
    );
    const isCurrentHostLocalDev = isLocalHostname(window.location.hostname);

    if (isConfiguredForLocalDev && !isCurrentHostLocalDev) {
      return currentOriginCallbackUrl;
    }

    return parsedConfiguredUrl.toString();
  } catch {
    return currentOriginCallbackUrl;
  }
}

export function getSupabaseProviderCallbackUrl() {
  const { supabaseUrl } = getSupabaseConfig();
  return `${supabaseUrl.replace(/\/$/, "")}/auth/v1/callback`;
}

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  return createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      detectSessionInUrl: false,
    },
  });
}
