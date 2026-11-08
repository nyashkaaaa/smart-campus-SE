import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Info,
  Users,
  SearchX,
} from "lucide-react";
import {
  canBook,
  labelToMinutes,
  minutesToLabel,
  MAX_DURATION_MINUTES,
  type AvailabilityOutcome,
} from "@/availability";
import { ALL_EQUIPMENT, filterRooms, type Equipment } from "@/rooms";
import { NOW, ROOMS } from "@/data/rooms";

const DEFAULT_ATTENDEES = "1";

/** Whole number >= 1, otherwise null. */
function parseAttendees(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  return n >= 1 ? n : null;
}

export default function App() {
  // Filters
  const [attendeesInput, setAttendeesInput] = useState(DEFAULT_ATTENDEES);
  const [requiredEquipment, setRequiredEquipment] = useState<Equipment[]>([]);

  // Selection and time window
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("10:30");
  const [endTime, setEndTime] = useState("12:30");
  const [endAtMidnight, setEndAtMidnight] = useState(false);

  // Result of the last check. Cleared whenever an input changes (F5).
  const [outcome, setOutcome] = useState<AvailabilityOutcome | null>(null);

  const attendees = parseAttendees(attendeesInput);
  const matchingRooms = useMemo(
    () =>
      attendees === null
        ? []
        : filterRooms(ROOMS, { attendees, requiredEquipment }),
    [attendees, requiredEquipment]
  );
  const selectedRoom =
    matchingRooms.find((room) => room.id === selectedRoomId) ?? null;

  const startMin = useMemo(() => labelToMinutes(startTime), [startTime]);
  const endMin = useMemo(
    () => (endAtMidnight ? 1440 : labelToMinutes(endTime)),
    [endAtMidnight, endTime]
  );

  // Applies new filter values, clears the result, and clears the selection
  // if the selected room no longer matches.
  function applyFilters(nextAttendeesInput: string, nextEquipment: Equipment[]) {
    setAttendeesInput(nextAttendeesInput);
    setRequiredEquipment(nextEquipment);
    setOutcome(null);

    const nextAttendees = parseAttendees(nextAttendeesInput);
    const stillMatches =
      nextAttendees !== null &&
      filterRooms(ROOMS, {
        attendees: nextAttendees,
        requiredEquipment: nextEquipment,
      }).some((room) => room.id === selectedRoomId);
    if (!stillMatches) setSelectedRoomId(null);
  }

  function toggleEquipment(item: Equipment) {
    const next = requiredEquipment.includes(item)
      ? requiredEquipment.filter((e) => e !== item)
      : [...requiredEquipment, item];
    applyFilters(attendeesInput, next);
  }

  function clearFilters() {
    applyFilters(DEFAULT_ATTENDEES, []);
  }

  function selectRoom(roomId: string) {
    setSelectedRoomId(roomId);
    setOutcome(null);
  }

  function handleCheck() {
    if (!selectedRoom) return;
    if (startMin === null || endMin === null) {
      setOutcome({
        available: false,
        reason: "Please enter valid times in 24-hour HH:MM format.",
      });
      return;
    }
    setOutcome(
      canBook({
        start: startMin,
        end: endMin,
        now: NOW,
        blocked: selectedRoom.blocked,
        existing: selectedRoom.bookings,
      })
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
            Find a room that fits your group and equipment needs, then check
            whether it is free for your chosen time window. This tool only
            checks availability — it does not create or confirm any booking.
          </p>
        </header>

        {/* Filters */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-700">
            Your requirements
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="attendees"
                className="mb-1 block text-sm font-medium text-slate-600"
              >
                Number of attendees
              </label>
              <input
                id="attendees"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={attendeesInput}
                onChange={(e) => applyFilters(e.target.value, requiredEquipment)}
                aria-invalid={attendees === null}
                aria-describedby={attendees === null ? "attendees-error" : undefined}
                className={`w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-1 ${
                  attendees === null
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {attendees === null && (
                <p id="attendees-error" className="mt-1 text-sm text-red-700">
                  Enter a whole number of attendees (1 or more).
                </p>
              )}
            </div>

            <fieldset>
              <legend className="mb-1 block text-sm font-medium text-slate-600">
                Required equipment
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ALL_EQUIPMENT.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={requiredEquipment.includes(item)}
                      onChange={() => toggleEquipment(item)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* Room list */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-base font-semibold text-slate-700">Rooms</h2>
            <p className="text-sm text-slate-500" aria-live="polite">
              {matchingRooms.length} of {ROOMS.length} rooms match
            </p>
          </div>

          {matchingRooms.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-50 px-4 py-8 text-center">
              <SearchX className="h-8 w-8 text-slate-400" aria-hidden />
              <p className="text-sm font-medium text-slate-600">
                No rooms match your requirements
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {matchingRooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => selectRoom(room.id)}
                      aria-pressed={isSelected}
                      className={`flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-row sm:items-center sm:justify-between ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {room.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                          <Users className="h-3.5 w-3.5" aria-hidden />
                          Capacity {room.capacity}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {room.equipment.map((item) => (
                            <span
                              key={item}
                              className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      {room.blocked && (
                        <span className="inline-flex flex-shrink-0 items-center gap-1.5 self-start rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 sm:self-center">
                          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                          Blocked
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Selected room */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {selectedRoom ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selected room
                  </p>
                  <p className="text-lg font-semibold">{selectedRoom.name}</p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-1 sm:items-end">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                    selectedRoom.blocked
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedRoom.blocked ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    aria-hidden
                  />
                  {selectedRoom.blocked ? "Blocked" : "Open"}
                </span>
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
              Current reference time (fixed for demo):{" "}
              <strong>{nowLabel}</strong>
            </span>
          </div>
        </section>

        {/* Time window and result */}
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
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setOutcome(null);
                }}
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
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setOutcome(null);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={endAtMidnight}
                  onChange={(e) => {
                    setEndAtMidnight(e.target.checked);
                    setOutcome(null);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                End at midnight (24:00)
              </label>
            </div>
          </div>

          {duration !== null && (
            <p className="mt-3 text-xs text-slate-500">
              Requested duration: {duration} minutes (max allowed:{" "}
              {MAX_DURATION_MINUTES}).
            </p>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={!selectedRoom}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:px-6"
          >
            Check Availability
          </button>

          {outcome && selectedRoom && (
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
                <p className="mt-0.5 text-sm">
                  {outcome.available
                    ? `${selectedRoom.name} is free for the requested window. No booking has been created.`
                    : outcome.reason}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Bookings of the selected room */}
        {selectedRoom && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 flex-shrink-0 text-slate-500" aria-hidden />
              <h2 className="text-base font-semibold text-slate-700">
                Existing bookings for {selectedRoom.name}
              </h2>
            </div>
            {selectedRoom.bookings.length === 0 ? (
              <p className="text-sm text-slate-500">No existing bookings.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {selectedRoom.bookings.map((b) => (
                  <li
                    key={b.id}
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
        )}
      </div>
    </div>
  );
}
