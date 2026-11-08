interface StatusBadgeProps {
  blocked: boolean;
  /** Extra layout classes for where the badge is placed. */
  className?: string;
}

/** Red "Blocked" or green "Open" pill. */
export function StatusBadge({ blocked, className }: StatusBadgeProps) {
  const color = blocked
    ? "bg-red-50 text-red-700"
    : "bg-emerald-50 text-emerald-700";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${color}${
        className ? ` ${className}` : ""
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${blocked ? "bg-red-500" : "bg-emerald-500"}`}
        aria-hidden
      />
      {blocked ? "Blocked" : "Open"}
    </span>
  );
}
