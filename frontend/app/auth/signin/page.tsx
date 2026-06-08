import { SignInForm } from "./_SignInForm";

type SignInPageProps = {
  searchParams?: Promise<{ next?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/";
  const error = params?.error;

  const destinationMatch = next.match(/[?&]destination=([^&]+)/);
  const destination = destinationMatch ? decodeURIComponent(destinationMatch[1]) : null;

  return <SignInForm destination={destination} error={error} next={next} />;
}
