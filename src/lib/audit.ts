export interface AuditResult {
  trustScore: number;
  flags: AuditFlag[];
  verdict: "Trusted" | "Caution" | "Suspicious";
  summary: string;
}

export interface AuditFlag {
  type: "positive" | "warning" | "danger";
  label: string;
  detail: string;
}

export function auditCreator(
  platform: "youtube" | "instagram",
  followers: number,
  following: number,
  engagementRate: number,
  postCount: number,
  isVerified: boolean
): AuditResult {
  const flags: AuditFlag[] = [];
  let score = 70;

  // Engagement-to-follower ratio check
  if (followers < 100_000) {
    if (engagementRate >= 3 && engagementRate <= 10) {
      score += 8;
      flags.push({ type: "positive", label: "Healthy engagement", detail: `${engagementRate}% is normal for ${formatK(followers)} followers` });
    } else if (engagementRate > 10) {
      score -= 15;
      flags.push({ type: "danger", label: "Suspiciously high engagement", detail: `${engagementRate}% is abnormally high — possible engagement pods or bought interactions` });
    } else if (engagementRate < 1) {
      score -= 10;
      flags.push({ type: "warning", label: "Low engagement", detail: `${engagementRate}% is below average — possible inactive or bought followers` });
    }
  } else {
    if (engagementRate >= 1 && engagementRate <= 5) {
      score += 8;
      flags.push({ type: "positive", label: "Healthy engagement", detail: `${engagementRate}% is normal for ${formatK(followers)} followers` });
    } else if (engagementRate > 8) {
      score -= 15;
      flags.push({ type: "danger", label: "Suspiciously high engagement", detail: `${engagementRate}% is abnormally high for this follower count` });
    } else if (engagementRate < 0.5) {
      score -= 12;
      flags.push({ type: "warning", label: "Very low engagement", detail: `${engagementRate}% suggests ghost followers or bought audience` });
    }
  }

  // Follower/following ratio (Instagram-specific)
  if (platform === "instagram" && following > 0) {
    const ratio = followers / following;
    if (ratio > 10) {
      score += 5;
      flags.push({ type: "positive", label: "Strong follower ratio", detail: `${ratio.toFixed(0)}:1 ratio indicates organic growth` });
    } else if (ratio < 1 && followers > 10_000) {
      score -= 10;
      flags.push({ type: "warning", label: "Follows more than followers", detail: `Following ${formatK(following)} with ${formatK(followers)} followers — possible follow-unfollow tactics` });
    } else if (ratio < 0.5 && followers > 50_000) {
      score -= 15;
      flags.push({ type: "danger", label: "Suspicious follow ratio", detail: `Large account following more people than followers — strong indicator of inorganic growth` });
    }
  }

  // Post count vs followers
  if (postCount > 0 && followers > 0) {
    const followersPerPost = followers / postCount;
    if (followersPerPost > 5000 && !isVerified) {
      score -= 8;
      flags.push({ type: "warning", label: "High followers per post", detail: `${formatK(followers)} followers with only ${postCount} posts — rapid unnatural growth possible` });
    }
    if (postCount > 100 && followersPerPost < 20) {
      score -= 5;
      flags.push({ type: "warning", label: "Low growth despite content", detail: `${postCount} posts but only ${formatK(followers)} followers — may indicate low-quality content` });
    }
  }

  // Verified badge
  if (isVerified) {
    score += 10;
    flags.push({ type: "positive", label: "Verified account", detail: "Platform-verified creator identity" });
  }

  // Content volume check
  if (postCount > 50) {
    score += 3;
    flags.push({ type: "positive", label: "Active creator", detail: `${postCount} posts shows consistent content creation` });
  } else if (postCount < 10 && followers > 10_000) {
    score -= 8;
    flags.push({ type: "warning", label: "Very few posts", detail: `Only ${postCount} posts with ${formatK(followers)} followers — unusual pattern` });
  }

  score = Math.max(0, Math.min(100, score));

  const verdict: AuditResult["verdict"] =
    score >= 70 ? "Trusted" : score >= 45 ? "Caution" : "Suspicious";

  const summary =
    verdict === "Trusted"
      ? "This creator shows healthy engagement patterns and organic growth indicators."
      : verdict === "Caution"
        ? "Some metrics raise questions. Review flagged items before committing budget."
        : "Multiple red flags detected. High risk of fake followers or engagement manipulation.";

  return { trustScore: score, flags, verdict, summary };
}

function formatK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}
