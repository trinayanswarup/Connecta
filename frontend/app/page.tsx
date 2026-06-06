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
  Wifi
} from "lucide-react";

import { DestinationBrowseCard } from "@/components/DestinationBrowseCard";
import { DestinationDirectory } from "@/components/DestinationDirectory";
import { HomeSearch } from "@/components/HomeSearch";
import { destinationHref, destinationOptions } from "@/lib/destination-catalog";

const popularDestinations = [
  {
    location: "Japan",
    flag: "JP",
    stats: "From $21 - City trips and rail days",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    themeColor: "18 72% 28%"
  },
  {
    location: "Italy",
    flag: "IT",
    stats: "From $14 - Rome, Venice, and beyond",
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
    themeColor: "17 65% 31%"
  },
  {
    location: "Thailand",
    flag: "TH",
    stats: "From $19 - Islands, cities, and stays",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    themeColor: "20 68% 29%"
  }
];

const steps = [
  {
    icon: <Plane className="h-5 w-5" />,
    title: "Tell us your trip",
    text: "Choose your destination, dates, and the way you use mobile data."
  },
  {
    icon: <SignalHigh className="h-5 w-5" />,
    title: "Compare clear options",
    text: "See data, validity, and price in a way that is easy to compare."
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "Install before you fly",
    text: "Follow a simple setup guide and land with data ready to go."
  }
];

const benefits = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "No roaming surprises",
    text: "See the data, price, and validity before you choose."
  },
  {
    icon: <Globe2 className="h-5 w-5" />,
    title: "Built for real travel",
    text: "Plans are framed around trip length, destination, and phone habits."
  },
  {
    icon: <LifeBuoy className="h-5 w-5" />,
    title: "Setup guidance included",
    text: "Know what to do before departure, at arrival, and offline."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#fbfaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[100rem] items-center justify-between px-5 py-4 sm:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white shadow-[0_18px_42px_-28px_rgba(15,23,42,0.65)]">
              C
            </span>
            <span className="text-xl font-semibold">Connecta</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <a className="transition hover:text-slate-950" href="#destinations">
              Destinations
            </a>
            <a className="transition hover:text-slate-950" href="#how-it-works">
              How it works
            </a>
            <a className="transition hover:text-slate-950" href="#trust">
              Benefits
            </a>
          </nav>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.75)] transition-colors duration-200 hover:bg-slate-800"
            href="/trip/new"
          >
            Find my plan
            <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[94rem] px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <div className="relative grid min-h-[36rem] overflow-hidden rounded-lg bg-white shadow-[0_32px_120px_-104px_rgba(15,23,42,0.52)] lg:grid-cols-[0.58fr_0.42fr]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.24]"
            style={{
              backgroundImage:
                "repeating-radial-gradient(ellipse at 12% 10%, transparent 0 70px, rgba(15,23,42,0.045) 71px 72px, transparent 73px 144px)"
            }}
          />
          <div className="relative z-10 flex flex-col justify-center px-6 py-20 sm:px-10 lg:px-14 xl:px-20">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Travel data, ready when you land</p>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.03] text-slate-950 sm:text-6xl lg:text-[4.15rem] xl:text-[4.9rem]">
              Stay connected without the roaming panic.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Find a travel eSIM for your destination, compare the real options, and set it up before departure.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_20px_60px_-36px_rgba(15,23,42,0.8)] transition-colors duration-200 hover:bg-slate-800"
                href="#plan-finder"
              >
                Find my plan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-orange-200 hover:bg-orange-50"
                href="#destinations"
              >
                Browse destinations
              </Link>
            </div>
            <div className="mt-12 grid max-w-2xl gap-4 text-sm font-medium text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-orange-700" />
                Keep your number
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-orange-700" />
                Avoid roaming surprises
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-orange-700" />
                Setup before departure
              </span>
            </div>
          </div>

          <div className="relative min-h-[26rem] overflow-hidden bg-[#eaf4ff] lg:min-h-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-[#eaf4ff]/20 lg:bg-gradient-to-r lg:from-white/10 lg:via-transparent lg:to-white/0" />
            <div className="absolute bottom-0 left-0 right-0 h-20 rounded-t-md bg-[#fbfaf7]" />
            <div className="absolute bottom-9 left-6 right-6 grid gap-3 sm:left-auto sm:w-72">
              <div className="rounded-md bg-white/90 p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.5)] backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Popular now</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">Japan 20GB</p>
                  </div>
                  <span className="rounded-md bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">$39.99</span>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-600">30 days of travel data with setup before departure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" id="plan-finder">
        <div className="grid gap-12 rounded-lg bg-white/90 p-7 shadow-[0_30px_110px_-94px_rgba(15,23,42,0.42)] sm:p-10 lg:grid-cols-[13rem_1fr] lg:items-center xl:grid-cols-[15rem_1fr]">
          <div>
            <p className="text-sm font-semibold text-orange-700">Find my plan</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 xl:text-3xl">Start with your trip.</h2>
          </div>
          <HomeSearch />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8" id="destinations">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-700">Popular destinations</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950">Travel data for places people love.</h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-slate-600">
            Pick a destination, then choose a plan yourself or start with a guided match.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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

        <DestinationDirectory destinations={destinationOptions} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-orange-700">What is an eSIM?</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">A digital SIM for travel data, without the counter queue.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <InfoTile icon={<Smartphone className="h-5 w-5" />} title="No plastic SIM" text="Install the plan digitally on supported phones." />
          <InfoTile icon={<Wifi className="h-5 w-5" />} title="Keep your number" text="Use travel data while your regular SIM stays available." />
          <InfoTile icon={<Globe2 className="h-5 w-5" />} title="Made for trips" text="Pick a destination, validity, and data amount that match your stay." />
        </div>
      </section>

      <section className="bg-[#fff4e8] py-28" id="how-it-works">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-orange-700">How it works</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">Find your plan in three calm steps</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <article className="rounded-md bg-white/90 p-7 shadow-[0_22px_78px_-66px_rgba(15,23,42,0.34)]" key={step.title}>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-orange-50 text-orange-700">{step.icon}</span>
                  <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-9 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8" id="trust">
        <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-orange-700">Benefits</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-slate-950">Built to feel clear before you buy.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Compare your options with clear plan details, simple setup guidance, and no roaming surprises.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <InfoTile icon={benefit.icon} key={benefit.title} text={benefit.text} title={benefit.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 pt-4 sm:px-8">
        <div className="grid gap-7 rounded-lg bg-slate-950 p-9 text-white shadow-[0_30px_104px_-76px_rgba(15,23,42,0.8)] sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-4xl font-semibold">Ready to choose a travel eSIM?</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Share your destination and data needs. We will show a clear plan and simple setup guidance.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#fff4e8] px-5 py-3 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-white"
            href="/trip/new"
          >
            Find my plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-md bg-white/90 p-7 shadow-[0_20px_72px_-64px_rgba(15,23,42,0.34)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_82px_-62px_rgba(15,23,42,0.4)]">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-orange-50 text-orange-700">{icon}</span>
      <h3 className="mt-9 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

