export type CheckoutPlan = {
  dataGb: number;
  name: string;
  priceUsd: number;
  provider: string;
  validityDays: number;
};

export function checkoutHrefForPlan(plan: CheckoutPlan, destination: string) {
  const params = new URLSearchParams({
    data: `${plan.dataGb} GB`,
    destination,
    plan: plan.name,
    price: plan.priceUsd.toFixed(2),
    provider: plan.provider,
    validity: `${plan.validityDays} days`
  });

  return `/checkout?${params.toString()}`;
}
