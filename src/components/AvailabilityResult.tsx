import { CheckCircle2, XCircle } from "lucide-react";
import type { AvailabilityOutcome } from "@/domain/availability";

interface AvailabilityResultProps {
  outcome: AvailabilityOutcome;
  roomName: string;
}

/** Green "Available" or red "Unavailable" box (AC5). */
export function AvailabilityResult({ outcome, roomName }: AvailabilityResultProps) {
  return (
    <div
      role="status"
      className={`mt-4 flex gap-3 rounded-lg p-4 ${
        outcome.available ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      }`}
    >
      {outcome.available ? (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden />
      ) : (
        <XCircle className="h-5 w-5 flex-shrink-0" aria-hidden />
      )}
      <div>
        <p className="font-semibold">
          {outcome.available ? "Available" : "Unavailable"}
        </p>
        <p className="mt-0.5 text-sm">
          {outcome.available
            ? `${roomName} is free for the requested window. No booking has been created.`
            : outcome.reason}
        </p>
      </div>
    </div>
  );
}
