"use client";

import { Blocks, LayoutDashboard, Menu, ScrollText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { WalletButton } from "./wallet-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Blocks },
  { href: "/certificates", label: "Certificates", icon: ScrollText },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/40">
            <Blocks className="size-5" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight">
              WorkChain
            </span>
            <span className="hidden text-[11px] text-zinc-500 sm:block">
              Reputation on-chain
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
                href={href}
                key={href}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <WalletButton />
        </div>

        <button
          aria-label="Toggle navigation"
          className="rounded-xl border border-zinc-800 p-2.5 text-zinc-300 md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-zinc-800 px-5 py-4 md:hidden">
          <nav className="mb-4 grid gap-1">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <WalletButton />
        </div>
      ) : null}
    </header>
  );
}

