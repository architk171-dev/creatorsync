export interface LinkedInProfile {
  publicIdentifier: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  about: string | null;
  location: string | null;
  industry: string | null;
  followerCount: number;
  connectionsCount: number;
  isVerified: boolean;
  isInfluencer: boolean;
  isCreator: boolean;
  isPremium: boolean;
  profilePicUrl: string | null;
  currentPosition: {
    title: string;
    company: string;
  } | null;
  topSkills: string[];
}

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function getLinkedInProfiles(
  profileUrls: string[]
): Promise<LinkedInProfile[]> {
  const cleaned = profileUrls
    .map((u) => {
      u = u.trim();
      if (u.startsWith("http")) return u.replace(/\/$/, "");
      return `https://www.linkedin.com/in/${u.replace(/^@/, "")}`;
    })
    .filter(Boolean);

  if (cleaned.length === 0) return [];

  const batch = cleaned.slice(0, 3);
  console.log(`Apify LinkedIn: fetching ${batch.length} profiles`);
  const startTime = Date.now();

  try {
    const res = await fetch(
      "https://api.apify.com/v2/acts/harvestapi~linkedin-profile-scraper/run-sync-get-dataset-items?token=" +
        APIFY_TOKEN +
        "&timeout=15",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: batch }),
        signal: AbortSignal.timeout(18000),
        cache: "no-store",
      }
    );

    console.log(`Apify LinkedIn responded: ${res.status} in ${Date.now() - startTime}ms`);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Apify LinkedIn error: ${res.status} - ${text.slice(0, 200)}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((p: Record<string, unknown>) => p.firstName || p.lastName)
      .map((p: Record<string, unknown>) => parseLinkedInProfile(p));
  } catch (e) {
    console.error(`Apify LinkedIn failed after ${Date.now() - startTime}ms:`, e);
    return [];
  }
}

function parseLocation(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    const loc = raw as Record<string, unknown>;
    const text = loc.linkedinText || loc.parsedText || loc.full || loc.city;
    if (typeof text === "string" && text.trim()) return text;
    const parts = [loc.city, loc.state, loc.country]
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0);
    if (parts.length > 0) return parts.join(", ");
    return null;
  }
  return null;
}

function parseLinkedInProfile(raw: Record<string, unknown>): LinkedInProfile {
  const firstName = String(raw.firstName || "");
  const lastName = String(raw.lastName || "");

  const currentPos = raw.currentPosition as Record<string, unknown>[] | undefined;
  let position: LinkedInProfile["currentPosition"] = null;
  if (Array.isArray(currentPos) && currentPos.length > 0) {
    position = {
      title: String(currentPos[0].title || ""),
      company: String(currentPos[0].companyName || currentPos[0].company || ""),
    };
  }

  const topSkills = Array.isArray(raw.topSkills)
    ? (raw.topSkills as string[]).slice(0, 10)
    : [];

  return {
    publicIdentifier: String(raw.publicIdentifier || ""),
    linkedinUrl: String(raw.linkedinUrl || ""),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    headline: String(raw.headline || ""),
    about: raw.about ? String(raw.about) : null,
    location: parseLocation(raw.location),
    industry: raw.industry ? String(raw.industry) : null,
    followerCount: Number(raw.followerCount) || 0,
    connectionsCount: Number(raw.connectionsCount) || 0,
    isVerified: Boolean(raw.verified),
    isInfluencer: Boolean(raw.influencer),
    isCreator: Boolean(raw.creator),
    isPremium: Boolean(raw.premium),
    profilePicUrl: raw.profilePicture ? String(raw.profilePicture) : null,
    currentPosition: position,
    topSkills,
  };
}
