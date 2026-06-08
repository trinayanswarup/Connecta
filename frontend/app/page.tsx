import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  LifeBuoy,
  Plane,
  ShieldCheck,
  SignalHigh,
  Smartphone,
  Wifi,
  Zap
} from "lucide-react";

import { DestinationBrowseCard } from "@/components/DestinationBrowseCard";
import { DestinationDirectory } from "@/components/DestinationDirectory";
import { HomeSearch } from "@/components/HomeSearch";
import { destinationHref, destinationOptions } from "@/lib/destination-catalog";

const popularDestinations = [
  {
    location: "Japan",
    flag: "🇯🇵",
    stats: "From $21 · City trips and rail days",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    themeColor: "18 72% 28%"
  },
  {
    location: "Italy",
    flag: "🇮🇹",
    stats: "From $14 · Rome, Venice, and beyond",
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
    themeColor: "17 65% 31%"
  },
  {
    location: "Thailand",
    flag: "🇹🇭",
    stats: "From $19 · Islands, cities, and stays",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    themeColor: "20 68% 29%"
  },
  {
    location: "United States",
    flag: "🇺🇸",
    stats: "From $29 · Coast to coast coverage",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80",
    themeColor: "220 65% 28%"
  },
  {
    location: "France",
    flag: "🇫🇷",
    stats: "From $16 · Paris and the French countryside",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    themeColor: "210 55% 32%"
  },
  {
    location: "Spain",
    flag: "🇪🇸",
    stats: "From $15 · Sun, cities, and coasts",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80",
    themeColor: "22 70% 30%"
  }
];

const steps = [
  {
    icon: <Plane className="h-6 w-6" />,
    title: "Tell us your trip",
    text: "Choose your destination, dates, and the way you use mobile data."
  },
  {
    icon: <SignalHigh className="h-6 w-6" />,
    title: "Compare clear options",
    text: "See data, validity, and price in a way that is easy to compare."
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Install before you fly",
    text: "Follow a simple setup guide and land with data ready to go."
  }
];

const benefits = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "No roaming surprises",
    text: "See the data, price, and validity before you choose. No bill shock after you land."
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: "Built for real travel",
    text: "Plans are framed around your trip length, destination, and phone habits."
  },
  {
    icon: <LifeBuoy className="h-6 w-6" />,
    title: "Setup guidance included",
    text: "Know exactly what to do before departure, at arrival, and when offline."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-[#FAFAF8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <Link className="flex items-center gap-2.5" href="/">
            <Wifi className="h-5 w-5 text-orange-600" />
            <span className="text-xl font-bold text-slate-950">Connecta</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <a className="transition-colors hover:text-slate-950" href="#destinations">
              Destinations
            </a>
            <a className="transition-colors hover:text-slate-950" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-slate-950" href="#trust">
              eSIM Guide
            </a>
          </nav>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-700"
            href="/trip/new"
          >
            Find my plan
            <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-3 pb-14 pt-4 sm:px-5">
        <div className="relative grid min-h-[42rem] overflow-hidden rounded-2xl bg-white shadow-[0_32px_120px_-80px_rgba(15,23,42,0.42)] lg:grid-cols-[0.58fr_0.42fr]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.2]"
            style={{
              backgroundImage:
                "repeating-radial-gradient(ellipse at 12% 10%, transparent 0 70px, rgba(15,23,42,0.045) 71px 72px, transparent 73px 144px)"
            }}
          />
          <div className="relative z-10 flex flex-col justify-center px-8 py-20 sm:px-10 lg:px-14 xl:px-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Travel data, ready when you land</p>
            <h1 className="mt-6 max-w-4xl text-6xl font-bold leading-[1.05] text-slate-950 sm:text-7xl lg:text-[4.5rem] xl:text-[5rem]">
              Stay connected without the roaming panic.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Find a travel eSIM for your destination, compare the real options, and set it up before departure.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-8 text-sm font-semibold text-white shadow-[0_20px_60px_-36px_rgba(15,23,42,0.8)] transition-all duration-200 hover:bg-slate-800"
                href="#plan-finder"
              >
                Find my plan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
                href="#destinations"
              >
                Browse destinations
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <BadgeCheck className="h-4 w-4 text-orange-600" />
                200+ destinations
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <BadgeCheck className="h-4 w-4 text-orange-600" />
                Instant activation
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <BadgeCheck className="h-4 w-4 text-orange-600" />
                Keep your number
              </span>
            </div>
          </div>

          <div className="relative min-h-[26rem] overflow-hidden bg-[#eaf4ff] lg:min-h-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center transition duration-700"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white/10 lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-8 left-5 right-5 sm:left-auto sm:w-76">
              <div className="rounded-2xl bg-white/95 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">🇯🇵 Popular now</p>
                    <p className="mt-1.5 text-lg font-bold text-slate-950">Japan 20GB</p>
                  </div>
                  <span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">$39.99</span>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-600">30 days of travel data with setup before departure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan finder strip */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8" id="plan-finder">
        <div className="rounded-2xl bg-white p-8 shadow-[0_30px_110px_-80px_rgba(15,23,42,0.38)] sm:p-10">
          <div className="mb-8 grid gap-6 lg:grid-cols-[14rem_1fr] lg:items-center xl:grid-cols-[16rem_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Find my plan</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 xl:text-4xl">Start with your destination and dates.</h2>
            </div>
            <HomeSearch />
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8" id="destinations">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Popular destinations</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Travel data for places people love.
            </h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-slate-500">
            Pick a destination to browse plans or start a guided match.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popularDestinations.map((destination) => (
            <DestinationBrowseCard
              flag={destination.flag}
              href={destinationHref(destination.location)}
              imageUrl={destination.imageUrl}
              key={destination.location}
              location={destination.location}
              stats={destination.stats}
              themeColor={destination.themeColor}
            />
          ))}
        </div>

        <div className="mt-16">
          <DestinationDirectory destinations={destinationOptions} />
        </div>
      </section>

      {/* What is an eSIM */}
      <section className="bg-[#F0FDF4] py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-14 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">What is an eSIM?</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                A digital SIM for travel data, without the counter queue.
              </h2>
            </div>
            <p className="text-base leading-8 text-slate-600">
              An eSIM is a digital SIM card built into your phone. Instead of buying a plastic SIM at the airport, you install a travel plan before you leave — and land with data ready to go. No queues, no swapping, no surprises.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile
              icon={<Smartphone className="h-6 w-6" />}
              title="No plastic SIM"
              text="Install the plan digitally on supported phones. Nothing to carry or lose."
            />
            <InfoTile
              icon={<Wifi className="h-6 w-6" />}
              title="Keep your number"
              text="Use travel data while your regular SIM stays active and reachable."
            />
            <InfoTile
              icon={<Globe2 className="h-6 w-6" />}
              title="Made for trips"
              text="Pick a destination, validity, and data amount that matches your stay."
            />
            <InfoTile
              icon={<Zap className="h-6 w-6" />}
              title="Works on arrival"
              text="No airport counters. Connect the moment your flight lands."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#FFF7ED] py-28" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">How it works</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">Find your plan in three calm steps</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <article className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-[0_22px_78px_-60px_rgba(15,23,42,0.28)]" key={step.title}>
                <span className="pointer-events-none absolute right-5 top-4 select-none text-6xl font-bold text-orange-100">
                  0{index + 1}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-700">
                  {step.icon}
                </span>
                <h3 className="mt-8 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-28 sm:px-8" id="trust">
        <div className="grid gap-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Benefits</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">Built to feel clear before you buy.</h2>
            <p className="mt-6 text-base leading-8 text-slate-600">
              Compare your options with clear plan details, simple setup guidance, and no roaming surprises.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
              href="/trip/new"
            >
              Find my plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5">
            {benefits.map((benefit) => (
              <InfoTile horizontal icon={benefit.icon} key={benefit.title} text={benefit.text} title={benefit.title} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#0F172A] py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-radial-gradient(ellipse at 80% 50%, transparent 0 70px, rgba(255,255,255,0.07) 71px 72px, transparent 73px 144px)"
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">Ready to travel?</p>
              <h2 className="mt-4 max-w-2xl text-5xl font-bold leading-tight text-white">
                Ready to choose a travel eSIM?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
                Share your destination and data needs. We will show a clear plan and simple setup guidance.
              </p>
            </div>
            <Link
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-700"
              href="/trip/new"
            >
              Find my plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <Wifi className="h-5 w-5 text-orange-500" />
                <span className="text-lg font-bold text-white">Connecta</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/50">
                Travel data, made simple. eSIM plans for 200+ destinations with setup before departure.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Destinations</p>
                <ul className="mt-5 space-y-3 text-sm text-white/60">
                  <li>
                    <a className="transition-colors hover:text-white" href="#destinations">Browse all</a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-white" href="#destinations">Popular</a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-white" href="#destinations">Regional plans</a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-white" href="#destinations">Global plans</a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">How it works</p>
                <ul className="mt-5 space-y-3 text-sm text-white/60">
                  <li>
                    <a className="transition-colors hover:text-white" href="#how-it-works">Step by step</a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-white" href="#trust">eSIM Guide</a>
                  </li>
                  <li>
                    <Link className="transition-colors hover:text-white" href="/trip/new">Find my plan</Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Support</p>
                <ul className="mt-5 space-y-3 text-sm text-white/60">
                  <li>
                    <a className="transition-colors hover:text-white" href="#">Contact</a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-white" href="#">Privacy</a>
                  </li>
                  <li>
                    <a className="transition-colors hover:text-white" href="#">Terms</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-14 border-t border-white/10 pt-8 text-sm text-white/30">
            © 2026 Connecta · Travel data, made simple
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoTile({
  icon,
  title,
  text,
  horizontal
}: {
  icon: ReactNode;
  title: string;
  text: string;
  horizontal?: boolean;
}) {
  if (horizontal) {
    return (
      <article className="flex items-start gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
        <span className="mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-700">
          {icon}
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-700">{icon}</span>
      <h3 className="mt-7 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
