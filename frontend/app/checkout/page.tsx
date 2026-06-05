import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";

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
    <main className="min-h-screen bg-[#fbfaf7] px-5 py-6 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-10 flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950" href="/trip/new">
            <ArrowLeft className="h-4 w-4" />
            Back to planner
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            Secure checkout
          </span>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.5)] sm:p-8">
            <p className="text-sm font-semibold text-orange-700">Checkout</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Review your eSIM plan</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Confirm the plan details before continuing to payment. Payment processing can be connected here when checkout is ready.
            </p>

            <div className="mt-8 grid gap-3">
              <CheckoutRow label="Destination" value={destination} />
              <CheckoutRow label="Plan" value={plan} />
              <CheckoutRow label="Provider" value={provider} />
              <CheckoutRow label="Data" value={data} />
              <CheckoutRow label="Validity" value={validity} />
            </div>

            <button className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto">
              <CreditCard className="h-4 w-4" />
              Continue to payment
            </button>
          </div>

          <aside className="rounded-lg border border-orange-100 bg-[#fff4e8] p-5 text-slate-950 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.5)]">
            <div className="text-sm text-slate-500">{provider}</div>
            <h2 className="mt-2 text-2xl font-semibold">{plan}</h2>
            <div className="mt-5 flex items-end justify-between gap-4 rounded-lg bg-white p-4">
              <div>
                <div className="text-sm text-slate-500">Total</div>
                <div className="mt-1 text-4xl font-semibold">${price}</div>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">{data}</span>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-700">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-700" />
                Install before departure
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-700" />
                Keep your regular number
              </span>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function CheckoutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-[#fbfaf7] px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function cleanParam(value: string | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanPrice(value: string | undefined) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}
