import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import {
  CHECKBOX,
  CHECKBOX_LABEL,
  FIELD_LABEL,
  INPUT_BASE,
  INPUT_DISABLED,
  INPUT_OK,
  SECTION_TITLE,
} from "@/components/styles";

interface TimeWindowFormProps {
  startTime: string;
  endTime: string;
  endAtMidnight: boolean;
  /** Requested duration in minutes, or null if the times cannot be parsed. */
  duration: number | null;
  maxDurationMinutes: number;
  canCheck: boolean;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onEndAtMidnightChange: (value: boolean) => void;
  onCheck: () => void;
  /** Rendered under the button, inside the same card (the result). */
  children?: ReactNode;
}

export function TimeWindowForm({
  startTime,
  endTime,
  endAtMidnight,
  duration,
  maxDurationMinutes,
  canCheck,
  onStartTimeChange,
  onEndTimeChange,
  onEndAtMidnightChange,
  onCheck,
  children,
}: TimeWindowFormProps) {
  return (
    <Card className="mb-6">
      <h2 className={`mb-4 ${SECTION_TITLE}`}>Check a time window</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start-time" className={FIELD_LABEL}>
            Start time
          </label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={`${INPUT_BASE} ${INPUT_OK}`}
          />
        </div>
        <div>
          <label htmlFor="end-time" className={FIELD_LABEL}>
            End time
          </label>
          <input
            id="end-time"
            type="time"
            value={endTime}
            disabled={endAtMidnight}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className={`${INPUT_BASE} ${INPUT_OK} ${INPUT_DISABLED}`}
          />
          <label className={`mt-2 ${CHECKBOX_LABEL}`}>
            <input
              type="checkbox"
              checked={endAtMidnight}
              onChange={(e) => onEndAtMidnightChange(e.target.checked)}
              className={CHECKBOX}
            />
            End at midnight (24:00)
          </label>
        </div>
      </div>

      {duration !== null && (
        <p className="mt-3 text-xs text-slate-500">
          Requested duration: {duration} minutes (max allowed:{" "}
          {maxDurationMinutes}).
        </p>
      )}

      <button
        type="button"
        onClick={onCheck}
        disabled={!canCheck}
        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:px-6"
      >
        Check Availability
      </button>

      {children}
    </Card>
  );
}
