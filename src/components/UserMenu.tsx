"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { LogIn, LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-card animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition px-3 py-1.5 border border-border rounded-full hover:border-accent/40"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm hover:text-foreground transition"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full border border-border"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-accent" />
          </div>
        )}
        <span className="hidden sm:inline text-muted max-w-[120px] truncate">
          {session.user?.name || session.user?.email}
        </span>
        <ChevronDown className="w-3 h-3 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium truncate">{session.user?.name}</p>
              <p className="text-[11px] text-muted truncate">{session.user?.email}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-background/50 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Profile & History
            </Link>
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-background/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
