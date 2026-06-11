import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { WalletButton } from "@/components/wallet-button";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-zinc-800/80">
        <div className="grid-surface absolute inset-0" />
        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="size-3.5" />
              Freelance escrow, verified on-chain
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Get paid with trust.
              <span className="block bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                Build reputation forever.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
              WorkChain locks project funds in a smart contract, releases
              payment after approval, and mints a permanent work certificate
              for the freelancer.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <WalletButton />
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
                href="/projects"
              >
                Explore projects
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                Non-custodial escrow
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-indigo-400" />
                NFT work certificate
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-10 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-700/70 bg-zinc-900/80 p-4 shadow-2xl shadow-black/50">
              <Image
                alt="WorkChain verified work certificate"
                className="aspect-square w-full rounded-3xl object-cover"
                height={1254}
                priority
                src="/assets/workchain-certificate.png"
                width={1254}
              />
              <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400">Work certificate</p>
                    <p className="mt-1 font-semibold">Project completed</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
            Simple by design
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            One clear path from agreement to proof.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: LockKeyhole,
              step: "01",
              title: "Fund secure escrow",
              description:
                "The client approves WCT and locks the exact project amount in the contract.",
            },
            {
              icon: CircleDollarSign,
              step: "02",
              title: "Approve and release",
              description:
                "After the freelancer submits proof, client approval releases payment immediately.",
            },
            {
              icon: BadgeCheck,
              step: "03",
              title: "Mint lasting proof",
              description:
                "A certificate NFT records the project, participants, amount, and completion date.",
            },
          ].map(({ icon: Icon, step, title, description }) => (
            <article
              className="rounded-2xl border border-zinc-800 bg-zinc-900/65 p-6"
              key={step}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold text-zinc-600">
                  {step}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

