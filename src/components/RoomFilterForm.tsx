import type { Equipment } from "@/domain/rooms";
import { Card } from "@/components/Card";
import {
  CHECKBOX,
  CHECKBOX_LABEL,
  FIELD_LABEL,
  INPUT_BASE,
  INPUT_ERROR,
  INPUT_OK,
  SECTION_TITLE,
} from "@/components/styles";

interface RoomFilterFormProps {
  attendeesInput: string;
  attendeesValid: boolean;
  equipmentOptions: readonly Equipment[];
  requiredEquipment: readonly Equipment[];
  onAttendeesChange: (value: string) => void;
  onToggleEquipment: (item: Equipment) => void;
}

export function RoomFilterForm({
  attendeesInput,
  attendeesValid,
  equipmentOptions,
  requiredEquipment,
  onAttendeesChange,
  onToggleEquipment,
}: RoomFilterFormProps) {
  return (
    <Card className="mb-6">
      <h2 className={`mb-4 ${SECTION_TITLE}`}>Your requirements</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="attendees" className={FIELD_LABEL}>
            Number of attendees
          </label>
          <input
            id="attendees"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={attendeesInput}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={!attendeesValid}
            aria-describedby={attendeesValid ? undefined : "attendees-error"}
            className={`${INPUT_BASE} ${attendeesValid ? INPUT_OK : INPUT_ERROR}`}
          />
          {!attendeesValid && (
            <p id="attendees-error" className="mt-1 text-sm text-red-700">
              Enter a whole number of attendees (1 or more).
            </p>
          )}
        </div>

        <fieldset>
          <legend className={FIELD_LABEL}>Required equipment</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {equipmentOptions.map((item) => (
              <label key={item} className={CHECKBOX_LABEL}>
                <input
                  type="checkbox"
                  checked={requiredEquipment.includes(item)}
                  onChange={() => onToggleEquipment(item)}
                  className={CHECKBOX}
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </Card>
  );
}
