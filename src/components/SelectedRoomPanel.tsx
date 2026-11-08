import { Building2, Clock } from "lucide-react";
import type { Room } from "@/domain/rooms";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { CAPTION } from "@/components/styles";

interface SelectedRoomPanelProps {
  room: Room | null;
  /** Current reference time, already formatted as HH:MM. */
  nowLabel: string;
}

export function SelectedRoomPanel({ room, nowLabel }: SelectedRoomPanelProps) {
  return (
    <Card className="mb-6">
      {room ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className={CAPTION}>Selected room</p>
              <p className="text-lg font-semibold">{room.name}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className={CAPTION}>Status</span>
            <StatusBadge blocked={room.blocked} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Select a room above to check its availability.
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden />
        <span>
          Current reference time (fixed for demo): <strong>{nowLabel}</strong>
        </span>
      </div>
    </Card>
  );
}
