import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold">
            Creator<span className="text-accent">Sync</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          <a href="/how-we-verify" className="hover:text-foreground transition">
            How We Verify
          </a>
          <a href="#" className="hover:text-foreground transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground transition">
            Terms
          </a>
          <a href="#" className="hover:text-foreground transition">
            Refund Policy
          </a>
        </div>

        <p className="text-[10px] text-muted">
          &copy; {new Date().getFullYear()} CreatorSync
        </p>
      </div>
    </footer>
  );
}
