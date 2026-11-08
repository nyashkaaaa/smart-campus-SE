import { Building2 } from "lucide-react";

export function Header() {
  return (
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
  );
}
