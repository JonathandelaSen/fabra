import { Suspense } from "react";
import { ActivityContextView } from "@/frontend/features/activity-context";

export default function ActivityContextsPage() {
  return (
    <Suspense>
      <ActivityContextView />
    </Suspense>
  );
}
