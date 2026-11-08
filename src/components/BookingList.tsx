import { CalendarDays, Info } from "lucide-react";
import type { ExistingBooking } from "@/domain/availability";
import { minutesToLabel } from "@/domain/time";
import { Card } from "@/components/Card";
import { SECTION_TITLE } from "@/components/styles";

interface BookingListProps {
  roomName: string;
  bookings: readonly ExistingBooking[];
}

/** Read-only list of the selected room's bookings. Never changes them (AC5). */
export function BookingList({ roomName, bookings }: BookingListProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 flex-shrink-0 text-slate-500" aria-hidden />
        <h2 className={SECTION_TITLE}>Existing bookings for {roomName}</h2>
      </div>
      {bookings.length === 0 ? (
        <p className="text-sm text-slate-500">No existing bookings.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-slate-700">{b.label}</span>
              <span className="text-sm text-slate-500">
                {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden />
        Checking availability never changes these bookings.
      </p>
    </Card>
  );
}
