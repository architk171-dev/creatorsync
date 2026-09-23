import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Database, Clock, FileCheck } from "lucide-react";

export default function HowWeVerify() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3">How We Verify</h1>
            <p className="text-muted text-sm">
              Every number in a CreatorSync report is pulled directly from
              platform APIs — not screenshots, not self-reported data, not
              third-party estimates.
            </p>
          </div>

          <div className="space-y-6">
            <Card
              icon={<Database className="w-5 h-5 text-accent" />}
              title="Direct API Access"
              description="We use the official YouTube Data API v3 and Instagram Graph API to fetch creator metrics. These are the same data sources the platforms themselves use. No scraping, no estimation."
            />
            <Card
              icon={<Clock className="w-5 h-5 text-accent" />}
              title="Real-Time Data"
              description="Reports are generated with live data at the time of request. Every metric includes a timestamp showing exactly when it was fetched, so you know the data is current."
            />
            <Card
              icon={<FileCheck className="w-5 h-5 text-accent" />}
              title="Transparent Methodology"
              description="Engagement rate = (average likes + comments) / views on the last 10 videos. Growth trend compares recent vs. older video performance. No proprietary 'scores' — just clear math on real data."
            />
            <Card
              icon={<Shield className="w-5 h-5 text-accent" />}
              title="Unique Report ID"
              description="Every report gets a unique, non-editable ID. If someone shares a report, you can verify its authenticity. The raw API numbers and timestamp are your proof."
            />
          </div>

          <div className="mt-12 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-2">What we don&apos;t do</h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                &bull; We don&apos;t use proprietary &ldquo;trust scores&rdquo;
                or black-box algorithms
              </li>
              <li>
                &bull; We don&apos;t estimate numbers — everything comes from
                the API
              </li>
              <li>
                &bull; We don&apos;t accept creator-submitted data or
                screenshots
              </li>
              <li>
                &bull; We don&apos;t cache old data — every report is a fresh
                API call
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Card({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
