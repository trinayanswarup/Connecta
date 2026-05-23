import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
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
import { destinationOptions } from "@/lib/destination-catalog";

const popularDestinations = [
  {
    location: "Japan",
    flag: "JP",
    stats: "From $21 - City trips and rail days",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    themeColor: "157 46% 23%"
  },
  {
    location: "Italy",
    flag: "IT",
    stats: "From $14 - Rome, Venice, and beyond",
    imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
    themeColor: "206 48% 27%"
  },
  {
    location: "Thailand",
    flag: "TH",
    stats: "From $19 - Islands, cities, and stays",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    themeColor: "184 55% 24%"
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
    text: "Connecta checks price, allowance, validity, and destination fit."
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
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white shadow-[0_18px_42px_-28px_rgba(15,23,42,0.65)]">
            C
          </span>
          <span className="text-xl font-semibold">Connecta</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
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
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          href="/trip/new"
        >
          Find my plan
          <ArrowRight className="hidden h-4 w-4 sm:block" />
        </Link>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-[94rem] px-4 pb-6 pt-2 sm:px-6 lg:px-8">
        <div className="relative grid w-full overflow-hidden rounded-lg border border-[#e7eceb] bg-white shadow-[0_34px_120px_-86px_rgba(15,23,42,0.55)] lg:grid-cols-[0.62fr_0.38fr]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage:
                "repeating-radial-gradient(ellipse at 22% 12%, transparent 0 58px, rgba(15,23,42,0.06) 59px 60px, transparent 61px 118px)"
            }}
          />
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
            <p className="text-base font-semibold text-teal-700">eSIM for international travel</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.03] text-slate-950 sm:text-6xl lg:text-[3.95rem] xl:text-[4.65rem]">
              Stay Connecta <span className="text-[#e84e6a]">wherever</span> you go
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              Choose a travel eSIM before you fly and land with data ready for maps, messages, rides, and everything the trip throws at you.
            </p>
            <div className="mt-8 flex items-center gap-3 text-xl font-semibold text-slate-800">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e5fff0] text-teal-700">
                <Check className="h-4 w-4" />
              </span>
              Keep your physical SIM
            </div>
            <div className="mt-8" id="plan-finder">
              <p className="mb-4 text-sm font-semibold text-slate-950">Find your ideal plan</p>
              <HomeSearch variant="hero" />
            </div>
          </div>

          <div className="relative min-h-[28rem] overflow-hidden bg-[#eaf4ff] lg:min-h-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-[#eaf4ff]/20 lg:bg-gradient-to-r lg:from-white/10 lg:via-transparent lg:to-white/0" />
            <div className="absolute bottom-0 left-0 right-0 h-16 rounded-t-[50%] bg-[#fbfaf7]" />
            <div className="absolute bottom-0 right-[8%] hidden gap-5 sm:flex">
              <span className="block h-28 w-8 bg-[#e84e6a]" />
              <span className="block h-28 w-8 bg-[#e84e6a]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8" id="destinations">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Popular destinations</p>
            <h2 className="mt-2 text-4xl font-semibold text-slate-950">Start with where you are headed</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-600">
            Destination browsing stays visual and emotional. Recommendations stay clear and decision-focused.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {popularDestinations.map((destination) => (
            <DestinationBrowseCard
              flag={destination.flag}
              href={`/trip/new?destination=${encodeURIComponent(destination.location)}`}
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

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-teal-700">What is an eSIM?</p>
          <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-950">A digital SIM for travel data, without the counter queue.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoTile icon={<Smartphone className="h-5 w-5" />} title="No plastic SIM" text="Install the plan digitally on supported phones." />
          <InfoTile icon={<Wifi className="h-5 w-5" />} title="Keep your number" text="Use travel data while your regular SIM stays available." />
          <InfoTile icon={<Globe2 className="h-5 w-5" />} title="Made for trips" text="Pick a destination, validity, and data amount that match your stay." />
        </div>
      </section>

      <section className="bg-[#fff4e8] py-16" id="how-it-works">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-orange-700">How it works</p>
            <h2 className="mt-2 text-4xl font-semibold text-slate-950">Find your plan in three calm steps</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_20px_70px_-56px_rgba(15,23,42,0.45)]" key={step.title}>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-orange-50 text-orange-700">{step.icon}</span>
                  <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" id="trust">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-teal-700">Benefits</p>
            <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-950">Built to feel clear before you buy.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Connecta balances travel discovery with calm recommendation clarity, so the final choice feels easy to trust.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <InfoTile icon={benefit.icon} key={benefit.title} text={benefit.text} title={benefit.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="grid gap-6 rounded-lg bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-4xl font-semibold">Ready to choose a travel eSIM?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Share your destination and data habits. Connecta will return a plan, alternatives, and a setup guide.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#dffcec] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white"
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
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-50px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-teal-200">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-teal-50 text-teal-700">{icon}</span>
      <h3 className="mt-8 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
