import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CheckoutForm } from "@/components/CheckoutForm";
import { createClient } from "@/lib/supabase/server";

type CheckoutPageProps = {
  searchParams?: Promise<{
    data?: string;
    destination?: string;
    plan?: string;
    price?: string;
    provider?: string;
    validity?: string;
    tripId?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;

  // Server-side auth guard (catches cases the middleware may miss, e.g. direct API calls)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let userEmail: string | undefined;

  if (supabaseUrl && supabaseKey) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email;
  }

  const destination = cleanParam(params?.destination, "your destination");
  const plan = cleanParam(params?.plan, `${destination} eSIM`);
  const data = cleanParam(params?.data, "Travel data");
  const validity = cleanParam(params?.validity, "30 days");
  const provider = cleanParam(params?.provider, "Connecta");
  const price = cleanPrice(params?.price);
  const creditVal = (Number(price) * 0.03).toFixed(2);

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-5 py-6 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-10 flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
            href="/trip/new"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to planner
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            Secure checkout
          </span>
        </nav>

        <CheckoutForm
          creditValue={creditVal}
          data={data}
          destination={destination}
          plan={plan}
          price={price}
          provider={provider}
          tripId={params?.tripId}
          userEmail={userEmail}
          validity={validity}
        />
      </div>
    </main>
  );
}

function cleanParam(value: string | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanPrice(value: string | undefined) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}
