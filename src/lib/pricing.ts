export interface PricingEstimate {
  platform: "youtube" | "instagram";
  tier: string;
  rates: { type: string; min: number; max: number }[];
  premiumFactors: string[];
}

const IG_TIERS: {
  name: string;
  min: number;
  max: number;
  rates: { type: string; min: number; max: number }[];
}[] = [
  {
    name: "Nano",
    min: 1_000,
    max: 10_000,
    rates: [
      { type: "Reel", min: 1_000, max: 5_000 },
      { type: "Story", min: 500, max: 2_000 },
      { type: "Static Post", min: 800, max: 3_000 },
      { type: "Story Series (3)", min: 1_500, max: 5_000 },
    ],
  },
  {
    name: "Micro",
    min: 10_000,
    max: 50_000,
    rates: [
      { type: "Reel", min: 5_000, max: 15_000 },
      { type: "Story", min: 2_000, max: 5_000 },
      { type: "Static Post", min: 3_000, max: 10_000 },
      { type: "Story Series (3)", min: 5_000, max: 12_000 },
    ],
  },
  {
    name: "Mid-Tier",
    min: 50_000,
    max: 200_000,
    rates: [
      { type: "Reel", min: 15_000, max: 50_000 },
      { type: "Story", min: 5_000, max: 15_000 },
      { type: "Static Post", min: 10_000, max: 30_000 },
      { type: "Story Series (3)", min: 12_000, max: 35_000 },
    ],
  },
  {
    name: "Macro",
    min: 200_000,
    max: 1_000_000,
    rates: [
      { type: "Reel", min: 50_000, max: 200_000 },
      { type: "Story", min: 15_000, max: 50_000 },
      { type: "Static Post", min: 30_000, max: 100_000 },
      { type: "Story Series (3)", min: 35_000, max: 120_000 },
    ],
  },
  {
    name: "Mega",
    min: 1_000_000,
    max: Infinity,
    rates: [
      { type: "Reel", min: 200_000, max: 1_000_000 },
      { type: "Story", min: 50_000, max: 200_000 },
      { type: "Static Post", min: 100_000, max: 500_000 },
      { type: "Story Series (3)", min: 120_000, max: 500_000 },
    ],
  },
];

const YT_TIERS: {
  name: string;
  min: number;
  max: number;
  rates: { type: string; min: number; max: number }[];
}[] = [
  {
    name: "Nano",
    min: 1_000,
    max: 10_000,
    rates: [
      { type: "Dedicated Video", min: 5_000, max: 15_000 },
      { type: "Integration (60s)", min: 2_000, max: 10_000 },
      { type: "YouTube Short", min: 1_000, max: 5_000 },
    ],
  },
  {
    name: "Micro",
    min: 10_000,
    max: 50_000,
    rates: [
      { type: "Dedicated Video", min: 15_000, max: 50_000 },
      { type: "Integration (60s)", min: 10_000, max: 30_000 },
      { type: "YouTube Short", min: 5_000, max: 15_000 },
    ],
  },
  {
    name: "Mid-Tier",
    min: 50_000,
    max: 200_000,
    rates: [
      { type: "Dedicated Video", min: 50_000, max: 150_000 },
      { type: "Integration (60s)", min: 30_000, max: 100_000 },
      { type: "YouTube Short", min: 15_000, max: 40_000 },
    ],
  },
  {
    name: "Macro",
    min: 200_000,
    max: 1_000_000,
    rates: [
      { type: "Dedicated Video", min: 150_000, max: 500_000 },
      { type: "Integration (60s)", min: 100_000, max: 300_000 },
      { type: "YouTube Short", min: 40_000, max: 150_000 },
    ],
  },
  {
    name: "Mega",
    min: 1_000_000,
    max: Infinity,
    rates: [
      { type: "Dedicated Video", min: 500_000, max: 2_500_000 },
      { type: "Integration (60s)", min: 300_000, max: 1_000_000 },
      { type: "YouTube Short", min: 150_000, max: 500_000 },
    ],
  },
];

const PREMIUM_CATEGORIES = [
  "Tech",
  "Finance",
  "Beauty",
  "Fitness",
  "Education",
];

export function estimateCreatorPricing(
  platform: "youtube" | "instagram",
  followers: number,
  engagementRate: number,
  category: string
): PricingEstimate {
  const tiers = platform === "instagram" ? IG_TIERS : YT_TIERS;
  const tier = tiers.find((t) => followers >= t.min && followers < t.max) || tiers[tiers.length - 1];

  const premiumFactors: string[] = [];
  let multiplier = 1;

  if (engagementRate > 5) {
    multiplier *= 1.3;
    premiumFactors.push("High engagement (>5%)");
  } else if (engagementRate > 3) {
    multiplier *= 1.15;
    premiumFactors.push("Above-average engagement");
  } else if (engagementRate < 1) {
    multiplier *= 0.8;
    premiumFactors.push("Below-average engagement (discount)");
  }

  if (PREMIUM_CATEGORIES.includes(category)) {
    multiplier *= 1.15;
    premiumFactors.push(`Premium category (${category})`);
  }

  const positionInTier = (followers - tier.min) / (tier.max === Infinity ? tier.min * 10 : tier.max - tier.min);
  const positionMultiplier = 0.8 + positionInTier * 0.4;
  multiplier *= positionMultiplier;

  const adjustedRates = tier.rates.map((r) => ({
    type: r.type,
    min: Math.round((r.min * multiplier) / 500) * 500,
    max: Math.round((r.max * multiplier) / 500) * 500,
  }));

  return {
    platform,
    tier: tier.name,
    rates: adjustedRates,
    premiumFactors,
  };
}

export function formatPrice(n: number): string {
  if (n >= 100_000) return "₹" + (n / 100_000).toFixed(1) + "L";
  if (n >= 1_000) return "₹" + (n / 1_000).toFixed(0) + "K";
  return "₹" + n;
}
