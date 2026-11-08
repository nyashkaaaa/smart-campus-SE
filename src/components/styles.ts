// Shared Tailwind class strings, so repeated UI patterns are defined once.
// Keep these as complete literal strings so Tailwind can find them when scanning sources.

/** Base look of every section card. */
export const CARD = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6";

/** Section heading text style. Spacing is added where it is used. */
export const SECTION_TITLE = "text-base font-semibold text-slate-700";

/** Label above a form field. */
export const FIELD_LABEL = "mb-1 block text-sm font-medium text-slate-600";

/** Text input / time input / number input base. Combine with INPUT_OK or INPUT_ERROR. */
export const INPUT_BASE = "w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-1";
export const INPUT_OK = "border-slate-300 focus:border-blue-500 focus:ring-blue-500";
export const INPUT_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500";
export const INPUT_DISABLED = "disabled:bg-slate-100 disabled:text-slate-400";

/** Checkbox and the inline label that wraps it. */
export const CHECKBOX = "h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500";
export const CHECKBOX_LABEL = "flex items-center gap-2 text-sm text-slate-600";

/** Small uppercase caption ("Selected room", "Status"). */
export const CAPTION = "text-xs font-medium uppercase tracking-wide text-slate-500";
