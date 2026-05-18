import { TripForm } from "@/components/TripForm";

export default function NewTripPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">Plan a trip</h1>
        <TripForm />
      </div>
    </main>
  );
}
