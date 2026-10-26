import Link from "next/link";
import { ShieldAlert, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <ShieldAlert className="w-12 h-12 text-accent mx-auto mb-4" />
        <p className="font-mono text-xs text-muted tracking-widest mb-2">404</p>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-sm text-muted mb-6">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
          >
            <Home className="w-4 h-4" />
            Back home
          </Link>
          <Link
            href="/campaign"
            className="inline-flex items-center gap-2 border border-border hover:bg-card text-foreground px-5 py-2.5 rounded-xl font-medium text-sm transition"
          >
            <Search className="w-4 h-4" />
            Plan a campaign
          </Link>
        </div>
      </div>
    </div>
  );
}
