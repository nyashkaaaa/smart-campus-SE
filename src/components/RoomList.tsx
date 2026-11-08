import { SearchX, Users } from "lucide-react";
import type { Room } from "@/domain/rooms";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { SECTION_TITLE } from "@/components/styles";

interface RoomListProps {
  rooms: readonly Room[];
  totalCount: number;
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  onClearFilters: () => void;
}

export function RoomList({
  rooms,
  totalCount,
  selectedRoomId,
  onSelect,
  onClearFilters,
}: RoomListProps) {
  return (
    <Card className="mb-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className={SECTION_TITLE}>Rooms</h2>
        <p className="text-sm text-slate-500" aria-live="polite">
          {rooms.length} of {totalCount} rooms match
        </p>
      </div>

      {rooms.length === 0 ? (
        <EmptyState onClearFilters={onClearFilters} />
      ) : (
        <ul className="flex flex-col gap-2">
          {rooms.map((room) => (
            <li key={room.id}>
              <RoomCard
                room={room}
                selected={room.id === selectedRoomId}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: (roomId: string) => void;
}

export function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      aria-pressed={selected}
      className={`flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-row sm:items-center sm:justify-between ${
        selected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">{room.name}</p>
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
        <StatusBadge blocked className="flex-shrink-0 self-start sm:self-center" />
      )}
    </button>
  );
}

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-50 px-4 py-8 text-center">
      <SearchX className="h-8 w-8 text-slate-400" aria-hidden />
      <p className="text-sm font-medium text-slate-600">
        No rooms match your requirements
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Clear filters
      </button>
    </div>
  );
}
