// State and composition only. Rules live in src/domain, markup in src/components.
import { useMemo, useState } from "react";
import { NOW, ROOMS } from "@/data/rooms";
import {
  MAX_DURATION_MINUTES,
  type AvailabilityOutcome,
} from "@/domain/availability";
import {
  ALL_EQUIPMENT,
  checkRoomAvailability,
  parseAttendees,
  roomsMatching,
  type Equipment,
} from "@/domain/rooms";
import { minutesToLabel, parseTimeWindow, windowDuration } from "@/domain/time";
import { Header } from "@/components/Header";
import { RoomFilterForm } from "@/components/RoomFilterForm";
import { RoomList } from "@/components/RoomList";
import { SelectedRoomPanel } from "@/components/SelectedRoomPanel";
import { TimeWindowForm } from "@/components/TimeWindowForm";
import { AvailabilityResult } from "@/components/AvailabilityResult";
import { BookingList } from "@/components/BookingList";

const DEFAULT_ATTENDEES = "1";

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

  // Derived values
  const attendees = parseAttendees(attendeesInput);
  const matchingRooms = useMemo(
    () => roomsMatching(ROOMS, attendees, requiredEquipment),
    [attendees, requiredEquipment]
  );
  const selectedRoom =
    matchingRooms.find((room) => room.id === selectedRoomId) ?? null;
  const timeWindow = useMemo(
    () => parseTimeWindow(startTime, endTime, endAtMidnight),
    [startTime, endTime, endAtMidnight]
  );
  const duration = timeWindow ? windowDuration(timeWindow) : null;

  // Applies new filter values, clears the result, and clears the selection
  // if the selected room no longer matches.
  function applyFilters(nextAttendeesInput: string, nextEquipment: Equipment[]) {
    setAttendeesInput(nextAttendeesInput);
    setRequiredEquipment(nextEquipment);
    setOutcome(null);

    const stillMatches = roomsMatching(
      ROOMS,
      parseAttendees(nextAttendeesInput),
      nextEquipment
    ).some((room) => room.id === selectedRoomId);
    if (!stillMatches) setSelectedRoomId(null);
  }

  function toggleEquipment(item: Equipment) {
    const next = requiredEquipment.includes(item)
      ? requiredEquipment.filter((e) => e !== item)
      : [...requiredEquipment, item];
    applyFilters(attendeesInput, next);
  }

  function selectRoom(roomId: string) {
    setSelectedRoomId(roomId);
    setOutcome(null);
  }

  function handleCheck() {
    if (!selectedRoom) return;
    setOutcome(checkRoomAvailability(selectedRoom, timeWindow, NOW));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Header />

        <RoomFilterForm
          attendeesInput={attendeesInput}
          attendeesValid={attendees !== null}
          equipmentOptions={ALL_EQUIPMENT}
          requiredEquipment={requiredEquipment}
          onAttendeesChange={(value) => applyFilters(value, requiredEquipment)}
          onToggleEquipment={toggleEquipment}
        />

        <RoomList
          rooms={matchingRooms}
          totalCount={ROOMS.length}
          selectedRoomId={selectedRoomId}
          onSelect={selectRoom}
          onClearFilters={() => applyFilters(DEFAULT_ATTENDEES, [])}
        />

        <SelectedRoomPanel room={selectedRoom} nowLabel={minutesToLabel(NOW)} />

        <TimeWindowForm
          startTime={startTime}
          endTime={endTime}
          endAtMidnight={endAtMidnight}
          duration={duration}
          maxDurationMinutes={MAX_DURATION_MINUTES}
          canCheck={selectedRoom !== null}
          onStartTimeChange={(value) => {
            setStartTime(value);
            setOutcome(null);
          }}
          onEndTimeChange={(value) => {
            setEndTime(value);
            setOutcome(null);
          }}
          onEndAtMidnightChange={(value) => {
            setEndAtMidnight(value);
            setOutcome(null);
          }}
          onCheck={handleCheck}
        >
          {outcome && selectedRoom && (
            <AvailabilityResult outcome={outcome} roomName={selectedRoom.name} />
          )}
        </TimeWindowForm>

        {selectedRoom && (
          <BookingList roomName={selectedRoom.name} bookings={selectedRoom.bookings} />
        )}
      </div>
    </div>
  );
}
