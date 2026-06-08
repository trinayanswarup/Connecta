import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BadgePercent, CheckCircle2, ChevronDown, CreditCard, ShieldCheck, Smartphone } from "lucide-react";

type CheckoutPageProps = {
  searchParams?: Promise<{
    data?: string;
    destination?: string;
    plan?: string;
    price?: string;
    provider?: string;
    validity?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const destination = cleanParam(params?.destination, "your destination");
  const plan = cleanParam(params?.plan, `${destination} eSIM`);
  const data = cleanParam(params?.data, "Travel data");
  const validity = cleanParam(params?.validity, "30 days");
  const provider = cleanParam(params?.provider, "Connecta");
  const price = cleanPrice(params?.price);

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-5 py-6 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-10 flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950" href="/trip/new">
            <ArrowLeft className="h-4 w-4" />
            Back to planner
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            Secure checkout
          </span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_31rem] lg:items-start">
          <div className="grid gap-6">
            <section className="rounded-2xl bg-white p-6 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)] sm:p-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Sign up or log in</h1>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-950 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.65)] transition hover:bg-slate-50" type="button">
                  <span className="text-lg font-bold text-orange-600">G</span>
                  Google
                </button>
                <button className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-950 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.65)] transition hover:bg-slate-50" type="button">
                  <Smartphone className="h-5 w-5 fill-slate-950 text-slate-950" />
                  Apple
                </button>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
                We will use your account to send your eSIM setup details and keep your plan available after checkout.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)] sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Select a payment method</h2>
              <div className="mt-6 grid gap-3">
                <PaymentMethod title="Credit or debit card">
                  <span className="font-semibold text-blue-900">VISA</span>
                  <span className="font-semibold text-orange-600">MC</span>
                  <span className="font-semibold text-blue-700">AMEX</span>
                </PaymentMethod>
                <PaymentMethod title="Google Pay">
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">G Pay</span>
                </PaymentMethod>
                <PaymentMethod title="PayPal">
                  <span className="font-semibold text-blue-700">PayPal</span>
                </PaymentMethod>
              </div>

              <button className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_54px_-38px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800" type="button">
                <CreditCard className="h-4 w-4" />
                Continue to payment
              </button>
            </section>
          </div>

          <aside className="rounded-2xl bg-slate-50 p-6 text-slate-950 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)] ring-1 ring-slate-100 lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold tracking-tight">Order summary</h2>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-600">
                <Smartphone className="h-4 w-4" />
              </span>
              <span className="font-semibold">{destination}</span>
            </div>
            <div className="mt-5 grid gap-4 border-b border-slate-200 pb-5 text-sm">
              <SummaryLine label="eSIM" value={plan} />
              <SummaryLine label="Plan" value={data} />
              <SummaryLine label="Type" value="Data only" />
              <SummaryLine label="Duration" value={validity} />
              <SummaryLine label="Provider" value={provider} />
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">Total</p>
                <button className="mt-3 text-sm text-slate-500 underline underline-offset-4" type="button">
                  Connecta credits
                </button>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">US${price}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-orange-800">
                  <BadgePercent className="h-3 w-3" />
                  + US${creditValue(price)}
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button className="h-10 rounded-xl bg-white px-3 text-sm font-semibold text-slate-950 ring-1 ring-slate-200 transition hover:bg-orange-50" type="button">
                Got a coupon?
              </button>
              <button className="h-10 rounded-xl bg-white px-3 text-sm font-semibold text-slate-950 ring-1 ring-slate-200 transition hover:bg-orange-50" type="button">
                Got credits?
              </button>
            </div>
            <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-slate-100">
              <div className="grid gap-3 text-sm text-slate-600">
                <TrustLine icon={<ShieldCheck className="h-4 w-4" />} text="Secure checkout" />
                <TrustLine icon={<CheckCircle2 className="h-4 w-4" />} text="Install before departure" />
                <TrustLine icon={<CheckCircle2 className="h-4 w-4" />} text="Keep your regular number" />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function PaymentMethod({ children, title }: { children: ReactNode; title: string }) {
  return (
    <button
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl bg-white px-5 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.45)] transition hover:bg-slate-50 hover:shadow-[inset_0_0_0_1px_rgba(234,88,12,0.28)]"
      type="button"
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className="text-base font-semibold text-slate-950">{title}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs">{children}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
    </button>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function TrustLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-orange-600">{icon}</span>
      {text}
    </span>
  );
}

function creditValue(price: string) {
  const parsed = Number(price);

  if (!Number.isFinite(parsed)) {
    return "0.00";
  }

  return (parsed * 0.03).toFixed(2);
}

function cleanParam(value: string | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanPrice(value: string | undefined) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}
