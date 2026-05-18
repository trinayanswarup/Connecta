type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">Trip {id}</h1>
        <p className="mt-3 text-slate-600">Trip recommendations and trace details will land here after the vertical flow is built.</p>
      </div>
    </main>
  );
}
