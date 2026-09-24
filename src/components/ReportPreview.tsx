"use client";

import {
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  Video,
  ThumbsUp,
  MessageSquare,
  Clock,
  Lock,
  Download,
  CheckCircle,
  BadgeCheck,
  Briefcase,
  Link as LinkIcon,
  Hash,
  AtSign,
  Image,
  Heart,
  ShieldCheck,
  IndianRupee,
  Percent,
  UserCheck,
  AlertTriangle,
  CircleAlert,
} from "lucide-react";
import { ReportData, InstagramPost } from "@/lib/types";
import { estimateCreatorPricing, formatPrice } from "@/lib/pricing";
import { auditCreator } from "@/lib/audit";
import { calculateROI } from "@/lib/roi";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function GrowthIcon({ flag }: { flag: string }) {
  if (flag === "Growing")
    return <TrendingUp className="w-4 h-4 text-success" />;
  if (flag === "Declining")
    return <TrendingDown className="w-4 h-4 text-danger" />;
  return <Minus className="w-4 h-4 text-warning" />;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-success border-success/30 bg-success/10"
      : score >= 40
        ? "text-warning border-warning/30 bg-warning/10"
        : "text-danger border-danger/30 bg-danger/10";
  return (
    <div
      className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-sm font-bold ${color}`}
    >
      {score}/100
    </div>
  );
}

function TrustBadge({ verdict, score }: { verdict: string; score: number }) {
  const config =
    verdict === "Trusted"
      ? { color: "text-success bg-success/10 border-success/30", icon: <ShieldCheck className="w-3.5 h-3.5" /> }
      : verdict === "Caution"
        ? { color: "text-warning bg-warning/10 border-warning/30", icon: <AlertTriangle className="w-3.5 h-3.5" /> }
        : { color: "text-danger bg-danger/10 border-danger/30", icon: <CircleAlert className="w-3.5 h-3.5" /> };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 ${config.color}`}>
      {config.icon} {verdict} · {score}/100
    </span>
  );
}

export default function ReportPreview({ report }: { report: ReportData }) {
  const yt = report.youtube;
  const ig = report.instagram;
  const isPaid = report.status === "paid";

  const igAudit = ig
    ? auditCreator("instagram", ig.followerCount, ig.followingCount, ig.engagementRate, ig.postCount, ig.isVerified)
    : null;

  const igPricing = ig
    ? estimateCreatorPricing("instagram", ig.followerCount, ig.engagementRate, ig.businessCategoryName || "general")
    : null;

  const igBaseRate = igPricing?.rates[0]
    ? Math.round((igPricing.rates[0].min + igPricing.rates[0].max) / 2)
    : 0;

  const igRoi = ig
    ? calculateROI("instagram", ig.followerCount, ig.engagementRate, igBaseRate)
    : null;

  const ytAudit = yt
    ? auditCreator("youtube", yt.channel.subscriberCount, 0, yt.avgEngagementRate, yt.channel.videoCount, false)
    : null;

  const ytPricing = yt
    ? estimateCreatorPricing("youtube", yt.channel.subscriberCount, yt.avgEngagementRate, "general")
    : null;

  const ytBaseRate = ytPricing?.rates[0]
    ? Math.round((ytPricing.rates[0].min + ytPricing.rates[0].max) / 2)
    : 0;

  const ytRoi = yt
    ? calculateROI("youtube", yt.channel.subscriberCount, yt.avgEngagementRate, ytBaseRate)
    : null;

  const topHashtags = ig?.recentPosts
    ?.flatMap((p) => p.hashtags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedHashtags = topHashtags
    ? Object.entries(topHashtags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];

  return (
    <section className="py-8 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-start gap-4">
          {(ig?.profilePicUrlHD || ig?.profilePicUrl || yt?.channel.thumbnailUrl) && (
            <img
              src={ig?.profilePicUrlHD || ig?.profilePicUrl || yt?.channel.thumbnailUrl}
              alt={yt?.channel.title || ig?.fullName || "Creator"}
              className="w-16 h-16 rounded-full border-2 border-accent/30 object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold truncate">
                {yt?.channel.title || ig?.fullName || "Creator"}
              </h2>
              {ig?.isVerified && (
                <BadgeCheck className="w-5 h-5 text-accent shrink-0" />
              )}
              <Shield className="w-4 h-4 text-accent shrink-0" />
            </div>
            <p className="text-sm text-muted">
              {yt?.channel.customUrl && `youtube.com/${yt.channel.customUrl}`}
              {yt && ig && " · "}
              {ig && `@${ig.username}`}
            </p>
            {ig?.biography && (
              <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">
                {ig.biography}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {ig?.isBusinessAccount && (
                <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {ig.businessCategoryName || "Business"}
                </span>
              )}
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                Verified via API
              </span>
              <span className="text-[10px] text-muted">
                {new Date(report.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
            {ig?.externalUrl && (
              <a
                href={ig.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-accent hover:underline mt-1.5 flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                {ig.externalUrl.replace(/^https?:\/\//, "").slice(0, 40)}
              </a>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted mt-3">
          Report ID: {report.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Verdict Panel */}
      <div className="bg-gradient-to-br from-accent/10 to-card rounded-2xl border border-accent/20 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
            Verdict
          </h3>
          <ScoreBadge score={report.verdict.overallScore} />
        </div>

        <p
          className={`text-sm mb-4 leading-relaxed ${isPaid ? "" : "blur-metric"}`}
        >
          {report.verdict.summary}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-[10px] text-muted mb-1">Engagement</p>
            <div
              className={`flex items-center gap-1 ${isPaid ? "" : "blur-metric"}`}
            >
              <CheckCircle
                className={`w-3.5 h-3.5 ${report.verdict.engagementVerdict === "above" ? "text-success" : report.verdict.engagementVerdict === "below" ? "text-danger" : "text-warning"}`}
              />
              <span className="text-sm font-semibold capitalize">
                {report.verdict.engagementVerdict} average
              </span>
            </div>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-[10px] text-muted mb-1">Growth</p>
            <div className="flex items-center gap-1">
              <GrowthIcon flag={report.verdict.growthFlag} />
              <span className="text-sm font-semibold">
                {report.verdict.growthFlag}
              </span>
            </div>
          </div>
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-[10px] text-muted mb-1">Consistency</p>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span className="text-sm font-semibold">
                {report.verdict.consistencyFlag}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Metrics */}
      {yt && (
        <>
          <div className="bg-card rounded-2xl border border-border p-6 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
              YouTube Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                icon={<Users className="w-4 h-4" />}
                label="Subscribers"
                value={formatNumber(yt.channel.subscriberCount)}
              />
              <MetricCard
                icon={<Eye className="w-4 h-4" />}
                label="Total Views"
                value={formatNumber(yt.channel.viewCount)}
                blurred={!isPaid}
              />
              <MetricCard
                icon={<Video className="w-4 h-4" />}
                label="Videos"
                value={formatNumber(yt.channel.videoCount)}
              />
              <MetricCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Engagement"
                value={`${yt.avgEngagementRate}%`}
                blurred={!isPaid}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <MetricCard
                icon={<Eye className="w-4 h-4" />}
                label="Last 30d Views"
                value={formatNumber(yt.last30DayViews)}
                blurred={!isPaid}
              />
              <MetricCard
                icon={<Clock className="w-4 h-4" />}
                label="Upload Frequency"
                value={yt.uploadFrequency}
              />
            </div>
          </div>

          {/* YouTube Pricing & Trust */}
          {ytPricing && ytAudit && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                  YouTube Valuation
                </h3>
                <TrustBadge verdict={ytAudit.verdict} score={ytAudit.trustScore} />
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${isPaid ? "" : "blur-metric"}`}>
                <MetricCard
                  icon={<IndianRupee className="w-4 h-4" />}
                  label="Est. Rate"
                  value={formatPrice(ytBaseRate)}
                />
                <MetricCard
                  icon={<IndianRupee className="w-4 h-4" />}
                  label="Range"
                  value={ytPricing.rates[0] ? `${formatPrice(ytPricing.rates[0].min)} – ${formatPrice(ytPricing.rates[0].max)}` : "—"}
                />
                <MetricCard
                  icon={<Percent className="w-4 h-4" />}
                  label="CPM"
                  value={ytRoi ? `₹${ytRoi.estimatedCPM.toFixed(0)}` : "—"}
                />
                <MetricCard
                  icon={<Eye className="w-4 h-4" />}
                  label="Est. Impressions"
                  value={ytRoi ? formatNumber(ytRoi.estimatedImpressions) : "—"}
                />
              </div>
              {ytAudit.flags.length > 0 && (
                <div className={`mt-4 space-y-1.5 ${isPaid ? "" : "blur-metric"}`}>
                  {ytAudit.flags.map((flag, i) => (
                    <p key={i} className="text-[11px] text-muted flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${flag.type === "danger" ? "bg-danger" : flag.type === "warning" ? "bg-warning" : "bg-success"}`} />
                      {flag.label}: {flag.detail}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top Videos */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
              Top Videos
            </h3>
            <div className="space-y-3">
              {yt.topVideos.slice(0, 5).map((video, i) => (
                <div
                  key={video.id}
                  className={`flex items-center gap-3 ${isPaid || i < 2 ? "" : "blur-metric"}`}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-20 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(video.viewCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {formatNumber(video.likeCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {formatNumber(video.commentCount)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-accent font-medium shrink-0">
                    {video.engagementRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Instagram Section — Enriched */}
      {ig && (
        <>
          <div className="bg-card rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                Instagram Metrics
              </h3>
              {ig.isVerified && (
                <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                icon={<Users className="w-4 h-4" />}
                label="Followers"
                value={formatNumber(ig.followerCount)}
              />
              <MetricCard
                icon={<UserCheck className="w-4 h-4" />}
                label="Following"
                value={formatNumber(ig.followingCount)}
                blurred={!isPaid}
              />
              <MetricCard
                icon={<Image className="w-4 h-4" />}
                label="Posts"
                value={formatNumber(ig.postCount)}
              />
              <MetricCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Engagement"
                value={`${ig.engagementRate}%`}
                blurred={!isPaid}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <MetricCard
                icon={<Clock className="w-4 h-4" />}
                label="Post Frequency"
                value={ig.postFrequency}
              />
              <MetricCard
                icon={<Video className="w-4 h-4" />}
                label="Highlights"
                value={ig.highlightReelCount.toString()}
              />
              <MetricCard
                icon={<Video className="w-4 h-4" />}
                label="IGTV Videos"
                value={ig.igtvVideoCount.toString()}
              />
            </div>
          </div>

          {/* Instagram Pricing & Trust */}
          {igPricing && igAudit && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                  Instagram Valuation
                </h3>
                <TrustBadge verdict={igAudit.verdict} score={igAudit.trustScore} />
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${isPaid ? "" : "blur-metric"}`}>
                <MetricCard
                  icon={<IndianRupee className="w-4 h-4" />}
                  label="Est. Rate"
                  value={formatPrice(igBaseRate)}
                />
                <MetricCard
                  icon={<IndianRupee className="w-4 h-4" />}
                  label="Range"
                  value={igPricing.rates[0] ? `${formatPrice(igPricing.rates[0].min)} – ${formatPrice(igPricing.rates[0].max)}` : "—"}
                />
                <MetricCard
                  icon={<Percent className="w-4 h-4" />}
                  label="CPM"
                  value={igRoi ? `₹${igRoi.estimatedCPM.toFixed(0)}` : "—"}
                />
                <MetricCard
                  icon={<Eye className="w-4 h-4" />}
                  label="Est. Impressions"
                  value={igRoi ? formatNumber(igRoi.estimatedImpressions) : "—"}
                />
              </div>
              {igAudit.flags.length > 0 && (
                <div className={`mt-4 space-y-1.5 ${isPaid ? "" : "blur-metric"}`}>
                  {igAudit.flags.map((flag, i) => (
                    <p key={i} className="text-[11px] text-muted flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${flag.type === "danger" ? "bg-danger" : flag.type === "warning" ? "bg-warning" : "bg-success"}`} />
                      {flag.label}: {flag.detail}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Posts */}
          {ig.recentPosts && ig.recentPosts.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                Recent Posts
              </h3>
              <div className="space-y-3">
                {ig.recentPosts.slice(0, isPaid ? 6 : 3).map((post, i) => (
                  <div
                    key={post.id}
                    className={`bg-background/50 rounded-xl p-3 ${!isPaid && i >= 2 ? "blur-metric" : ""}`}
                  >
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2 mb-2">
                      {post.caption || "No caption"}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(post.likeCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {formatNumber(post.commentCount)}
                      </span>
                      <span className="capitalize text-[10px] bg-card border border-border px-1.5 py-0.5 rounded">
                        {post.type}
                      </span>
                      <span className="text-[10px]">
                        {new Date(post.timestamp).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.hashtags.slice(0, 5).map((tag) => (
                          <span key={tag} className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                        {post.hashtags.length > 5 && (
                          <span className="text-[9px] text-muted">+{post.hashtags.length - 5}</span>
                        )}
                      </div>
                    )}
                    {post.mentions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.mentions.map((m) => (
                          <span key={m} className="text-[9px] text-muted bg-card border border-border px-1.5 py-0.5 rounded">
                            @{m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Hashtags */}
          {sortedHashtags.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                Top Hashtags
              </h3>
              <div className={`flex flex-wrap gap-2 ${isPaid ? "" : "blur-metric"}`}>
                {sortedHashtags.map(([tag, count]) => (
                  <span key={tag} className="text-xs bg-accent/10 text-accent border border-accent/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    {tag}
                    <span className="text-[10px] text-accent/60">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Profiles */}
          {ig.relatedProfiles && ig.relatedProfiles.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
                Related Profiles
              </h3>
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${isPaid ? "" : "blur-metric"}`}>
                {ig.relatedProfiles.slice(0, 6).map((profile) => (
                  <div key={profile.username} className="bg-background/50 rounded-xl p-3 flex items-center gap-2">
                    <AtSign className="w-3.5 h-3.5 text-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{profile.fullName}</p>
                      <p className="text-[10px] text-muted flex items-center gap-1">
                        @{profile.username}
                        {profile.isVerified && <BadgeCheck className="w-3 h-3 text-accent" />}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Pay CTA */}
      {!isPaid && (
        <div className="bg-card rounded-2xl border border-accent/30 p-6 text-center">
          <Lock className="w-8 h-8 text-accent mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Unlock Full Report</h3>
          <p className="text-sm text-muted mb-4">
            Get the complete verified report with all metrics, detailed
            engagement benchmarks, and a downloadable PDF.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white px-8 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Pay ₹2,500
              <span className="text-xs opacity-70 line-through">₹5,000</span>
            </button>
            <button className="w-full sm:w-auto border border-border hover:border-muted text-foreground px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              3 Reports — ₹12,500
            </button>
          </div>

          <p className="text-[10px] text-muted mt-3">
            Launch offer: first report at ₹2,500. Includes PDF + GST invoice.
          </p>
        </div>
      )}
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  blurred = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  blurred?: boolean;
}) {
  return (
    <div className="bg-background/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-muted mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className={`text-lg font-bold ${blurred ? "blur-metric" : ""}`}>
        {value}
      </p>
    </div>
  );
}
