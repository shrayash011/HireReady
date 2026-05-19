import { getDashboardData } from "@/lib/dashboard-data";
import { TrackerView } from "@/components/dashboard/TrackerView";

export const metadata = {
  title: "Tracker · HireReady"
};

export default async function TrackerPage() {
  const { applications } = await getDashboardData();
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <TrackerView initial={applications} />
    </div>
  );
}
