import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Info,
} from "lucide-react";
import {
  canBook,
  labelToMinutes,
  minutesToLabel,
  type ExistingBooking,
} from "@/availability";

const ROOM = { id: "A-201", name: "Room A-201", blocked: false };
const NOW = 600; // 10:00 — fixed for predictable demonstration/testing

const INITIAL_BOOKINGS: ExistingBooking[] = [
  { start: 9 * 60, end: 10 * 60, label: "Intro to Algorithms" },
  { start: 11 * 60, end: 12 * 60 + 30, label: "Linear Algebra" },
  { start: 14 * 60, end: 15 * 60, label: "Study Group" },
];

export default function App() {
  const [bookings] = useState<ExistingBooking[]>(INITIAL_BOOKINGS);
  const [roomBlocked, setRoomBlocked] = useState(false);
  const [startTime, setStartTime] = useState("10:30");
  const [endTime, setEndTime] = useState("12:30");
  const [endAtMidnight, setEndAtMidnight] = useState(false);
  const [outcome, setOutcome] = useState<{
    available: boolean;
    reason?: string;
  } | null>(null);

  const startMin = useMemo(() => labelToMinutes(startTime), [startTime]);
  const endMin = useMemo(
    () => (endAtMidnight ? 1440 : labelToMinutes(endTime)),
    [endAtMidnight, endTime]
  );

  function handleCheck() {
    if (startMin === null || endMin === null) {
      setOutcome({
        available: false,
        reason: "Please enter valid times in 24-hour HH:MM format.",
      });
      return;
    }
    const result = canBook({
      start: startMin,
      end: endMin,
      now: NOW,
      blocked: roomBlocked,
      existing: bookings,
    });
    setOutcome(
      result.available ? { available: true } : { available: false, reason: result.reason }
    );
  }

  const nowLabel = minutesToLabel(NOW);
  const duration =
    startMin !== null && endMin !== null ? endMin - startMin : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-blue-700">
            <Building2 className="h-6 w-6" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Campus Tools
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            Smart Campus Room Availability Checker
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Quickly check whether a selected university room is free for your
            chosen time window. This tool only checks availability — it does not
            create or confirm any booking.
          </p>
        </header>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Building2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Selected room
                </p>
                <p className="text-lg font-semibold">{ROOM.name}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                  roomBlocked
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    roomBlocked ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  aria-hidden
                />
                {roomBlocked ? "Blocked" : "Open"}
              </span>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={roomBlocked}
              onChange={(e) => setRoomBlocked(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Simulate room blocked (for testing AC3)
          </label>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" aria-hidden />
            <span>
              Current reference time (fixed for demo):{" "}
              <strong>{nowLabel}</strong>
            </span>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-700">
            Check a time window
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="start-time"
                className="mb-1 block text-sm font-medium text-slate-600"
              >
                Start time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="end-time"
                className="mb-1 block text-sm font-medium text-slate-600"
              >
                End time
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                disabled={endAtMidnight}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={endAtMidnight}
                  onChange={(e) => setEndAtMidnight(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                End at midnight (24:00)
              </label>
            </div>
          </div>

          {duration !== null && (
            <p className="mt-3 text-xs text-slate-500">
              Requested duration: {duration} minutes (max allowed: 120).
            </p>
          )}

          <button
            type="button"
            onClick={handleCheck}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-6"
          >
            Check Availability
          </button>

          {outcome && (
            <div
              role="status"
              className={`mt-4 flex gap-3 rounded-lg p-4 ${
                outcome.available
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
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
                {!outcome.available && outcome.reason && (
                  <p className="mt-0.5 text-sm">{outcome.reason}</p>
                )}
                {outcome.available && (
                  <p className="mt-0.5 text-sm">
                    This room is free for the requested window. No booking has
                    been created.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-500" aria-hidden />
            <h2 className="text-base font-semibold text-slate-700">
              Existing bookings for {ROOM.name}
            </h2>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No existing bookings.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {bookings.map((b, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {b.label}
                  </span>
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
        </section>
      </div>
    </div>
  );
}
