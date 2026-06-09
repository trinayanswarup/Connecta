"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgePercent,
  CheckCircle2,
  ChevronDown,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Tag,
  UserCircle2,
  Wallet
} from "lucide-react";

type PaymentMethod = "card" | "googlepay" | "paypal";

type CheckoutFormProps = {
  destination: string;
  plan: string;
  data: string;
  validity: string;
  provider: string;
  price: string;
  creditValue: string;
  userEmail?: string;
};

export function CheckoutForm({
  destination,
  plan,
  data,
  validity,
  provider,
  price,
  creditValue,
  userEmail
}: CheckoutFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [email, setEmail] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setIsGuest(Boolean(localStorage.getItem("connecta_guest_session")));
    }
  }, [userEmail]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    if (selectedMethod === "card") {
      const rawCard = cardNumber.replace(/\s/g, "");
      if (!rawCard || rawCard.length < 16 || !expiry || expiry.length < 5 || !cvv || cvv.length < 3 || !cardName.trim()) {
        setCardError("Please fill in all card details to continue.");
        return;
      }
    }
    setCardError(null);
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 ring-4 ring-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="mt-7 text-4xl font-bold text-slate-950">Your eSIM is ready.</h1>
        <p className="mt-3 max-w-sm text-base leading-7 text-slate-500">
          Check <strong className="text-slate-950">{email}</strong> for your QR code and setup
          guide. Install your <strong className="text-slate-950">{destination}</strong> eSIM before
          you fly.
        </p>
        <div className="mt-8 w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm">
          <div className="grid gap-3 text-sm">
            <SummaryLine label="Plan" value={plan} />
            <SummaryLine label="Data" value={data} />
            <SummaryLine label="Valid for" value={validity} />
            <SummaryLine label="Total paid" value={`US$${price}`} />
          </div>
        </div>
        <Link
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-8 text-sm font-semibold text-white transition-all hover:bg-slate-800"
          href="/trip/new"
        >
          Plan another trip
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_31rem] lg:items-start">
        <div className="grid gap-6">
          {/* Signed in / guest banner */}
          {(userEmail || isGuest) ? (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-3.5 ring-1 ring-emerald-200/60">
              <UserCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                {isGuest ? (
                  <p className="text-sm font-semibold text-slate-950">Continuing as guest</p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-emerald-700">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-slate-950">{userEmail}</p>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* Payment */}
          <section className="rounded-2xl bg-white p-6 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)] sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Payment method</h2>
            <div className="mt-5 grid gap-2.5">
              <PaymentOption
                active={selectedMethod === "card"}
                onClick={() => { setSelectedMethod("card"); setCardError(null); }}
                title="Credit or debit card"
              >
                <span className="font-bold text-blue-900 text-xs">VISA</span>
                <span className="font-bold text-orange-600 text-xs">MC</span>
                <span className="font-bold text-blue-700 text-xs">AMEX</span>
              </PaymentOption>

              {selectedMethod === "card" && (
                <div className="grid gap-3 rounded-2xl bg-[#FAFAF8] p-5 ring-1 ring-slate-100">
                  <input
                    className={inputCls}
                    maxLength={19}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="Card number"
                    title="Card number"
                    type="text"
                    value={cardNumber}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className={inputCls}
                      maxLength={5}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM / YY"
                      title="Expiry date"
                      type="text"
                      value={expiry}
                    />
                    <input
                      className={inputCls}
                      maxLength={4}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="CVV"
                      title="CVV"
                      type="text"
                      value={cvv}
                    />
                  </div>
                  <input
                    className={inputCls}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Cardholder name"
                    title="Cardholder name"
                    type="text"
                    value={cardName}
                  />
                </div>
              )}

              <PaymentOption
                active={selectedMethod === "googlepay"}
                onClick={() => { setSelectedMethod("googlepay"); setCardError(null); }}
                title="Google Pay"
              >
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">G Pay</span>
              </PaymentOption>

              {selectedMethod === "googlepay" && (
                <p className="rounded-2xl bg-[#FAFAF8] px-5 py-4 text-sm text-slate-500 ring-1 ring-slate-100">
                  Google Pay is coming soon. Please use a card to complete your purchase.
                </p>
              )}

              <PaymentOption
                active={selectedMethod === "paypal"}
                onClick={() => { setSelectedMethod("paypal"); setCardError(null); }}
                title="PayPal"
              >
                <span className="font-bold text-blue-700 text-sm">PayPal</span>
              </PaymentOption>

              {selectedMethod === "paypal" && (
                <p className="rounded-2xl bg-[#FAFAF8] px-5 py-4 text-sm text-slate-500 ring-1 ring-slate-100">
                  PayPal is coming soon. Please use a card to complete your purchase.
                </p>
              )}
            </div>

            {/* Activation email */}
            <div className="mt-7 border-t border-slate-100 pt-6">
              <label className="mb-1.5 block text-sm font-semibold text-slate-950" htmlFor="activation-email">
                Where should we send your eSIM?
              </label>
              <p className="mb-3 text-xs text-slate-400">
                We&apos;ll email your QR code and setup guide to this address.
              </p>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                  id="activation-email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  title="Activation email"
                  type="email"
                  value={email}
                />
              </div>
            </div>

            {cardError && (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {cardError}
              </div>
            )}

            <button
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_54px_-38px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isProcessing || !email.includes("@")}
              type="submit"
            >
              {isProcessing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing payment…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay US${price}
                </>
              )}
            </button>
          </section>
        </div>

        {/* Order summary */}
        <aside className="rounded-2xl bg-slate-50 p-6 text-slate-950 ring-1 ring-slate-100 lg:sticky lg:top-24">
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
            <p className="font-bold">Total</p>
            <div className="text-right">
              <p className="text-xl font-bold">US${price}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-semibold text-orange-800">
                <BadgePercent className="h-3 w-3" />
                + US${creditValue} credits
              </span>
            </div>
          </div>

          {/* Coupon */}
          <div className="mt-5 grid gap-2">
            <button
              className={`flex h-10 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold transition ${
                couponOpen
                  ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                  : "bg-white text-slate-950 ring-1 ring-slate-200 hover:bg-orange-50"
              }`}
              onClick={() => setCouponOpen((v) => !v)}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Got a coupon?
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${couponOpen ? "rotate-180" : ""}`} />
            </button>
            {couponOpen && (
              <div className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  title="Coupon code"
                  value={couponCode}
                />
                <button
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  onClick={() => { if (couponCode.trim()) setCouponApplied(true); }}
                  type="button"
                >
                  Apply
                </button>
              </div>
            )}
            {couponApplied && (
              <p className="text-xs font-semibold text-red-500">
                This coupon code is not valid
              </p>
            )}
          </div>

          {/* Credits */}
          <div className="mt-2 grid gap-2">
            <button
              className={`flex h-10 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold transition ${
                creditsOpen
                  ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                  : "bg-white text-slate-950 ring-1 ring-slate-200 hover:bg-orange-50"
              }`}
              onClick={() => setCreditsOpen((v) => !v)}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5" />
                Got credits?
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${creditsOpen ? "rotate-180" : ""}`} />
            </button>
            {creditsOpen && (
              <div className="rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200">
                You have{" "}
                <span className="font-semibold text-slate-950">US$0.00</span> in Connecta credits.
              </div>
            )}
          </div>

          {/* Trust */}
          <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-slate-100">
            <div className="grid gap-3 text-sm text-slate-600">
              <TrustLine icon={<ShieldCheck className="h-4 w-4" />} text="Secure checkout" />
              <TrustLine icon={<CheckCircle2 className="h-4 w-4" />} text="Install before departure" />
              <TrustLine icon={<CheckCircle2 className="h-4 w-4" />} text="Keep your regular number" />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function PaymentOption({
  active,
  children,
  onClick,
  title
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl px-5 text-left transition ${
        active
          ? "bg-orange-50 shadow-[inset_0_0_0_2px_rgba(234,88,12,0.4)]"
          : "bg-white shadow-[inset_0_0_0_1px_rgba(148,163,184,0.45)] hover:bg-slate-50"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`h-4 w-4 shrink-0 rounded-full border-2 ${
            active ? "border-orange-600 bg-orange-600" : "border-slate-300 bg-white"
          }`}
        />
        <span className="text-sm font-semibold text-slate-950">{title}</span>
      </span>
      <span className="flex flex-wrap items-center gap-2">{children}</span>
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

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50";

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}
