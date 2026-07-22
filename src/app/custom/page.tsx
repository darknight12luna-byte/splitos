import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

// Temporary placeholder — the full Custom tab (Build Your Routine, Session Caption,
// Training Schedule, Popular Templates) is a later step in the redesign. This just
// keeps the bottom-nav tab from being a dead link in the meantime.
export default function CustomPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Custom</h1>
        <p className="text-sm text-muted">This tab is being redesigned — for now, jump straight in:</p>
      </div>

      <Link href="/checkin">
        <Card className="transition hover:shadow-md">
          <p className="font-semibold">Build Your Routine</p>
          <p className="text-sm text-muted">Pick a split day and start today&apos;s check-in</p>
        </Card>
      </Link>

      <Link href="/program">
        <Card className="transition hover:shadow-md">
          <p className="font-semibold">Training Schedule</p>
          <p className="text-sm text-muted">View the active weekly program</p>
        </Card>
      </Link>
    </div>
  );
}
