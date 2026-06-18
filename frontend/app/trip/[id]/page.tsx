import TripDetail from "@/components/TripDetail";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  return <TripDetail tripId={id} />;
}
