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
} from "lucide-react";
import { ReportData } from "@/lib/types";

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

export default function ReportPreview({ report }: { report: ReportData }) {
  const yt = report.youtube;
  const ig = report.instagram;
  const isPaid = report.status === "paid";

  return (
    <section className="py-8 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-start gap-4">
          {yt?.channel.thumbnailUrl && (
            <img
              src={yt.channel.thumbnailUrl}
              alt={yt.channel.title}
              className="w-16 h-16 rounded-full border-2 border-accent/30"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold truncate">
                {yt?.channel.title || ig?.fullName || "Creator"}
              </h2>
              <Shield className="w-4 h-4 text-accent shrink-0" />
            </div>
            <p className="text-sm text-muted">
              {yt?.channel.customUrl && `youtube.com/${yt.channel.customUrl}`}
              {yt && ig && " · "}
              {ig && `@${ig.username}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                Verified via YouTube Data API
              </span>
              <span className="text-[10px] text-muted">
                {new Date(report.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
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

      {/* Instagram */}
      {ig && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
            Instagram
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={<Users className="w-4 h-4" />}
              label="Followers"
              value={formatNumber(ig.followerCount)}
            />
            <MetricCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Engagement"
              value={`${ig.engagementRate}%`}
              blurred={!isPaid}
            />
            <MetricCard
              icon={<Clock className="w-4 h-4" />}
              label="Frequency"
              value={ig.postFrequency}
            />
          </div>
        </div>
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
