// A missing or misspelled env var must never silently resolve to live mode.
export const dodoEnvironment =
  process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";

export const DODO_PRO_PRODUCT_ID = process.env.DODO_PRO_PRODUCT_ID || "";
