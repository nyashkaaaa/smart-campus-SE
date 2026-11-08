# Smart Campus Room Availability Checker

Assignment #04 – Software Engineering
Diana Dzhadrinova, 24B032210

A small React + TypeScript web app that lets a student find a campus room that fits
their group and equipment needs, and check whether that room is free for a chosen
time window. It only **checks** availability: it never creates or changes a booking.

All data is fictional. There is no login, database, payment or live API.
The current time is fixed at **10:00** so results are predictable.

## Features

- Catalog of 5 fictional rooms, each with an ID, name, capacity, equipment, blocked
  status and its own bookings
- Filters by number of attendees (F1) and required equipment (F2)
- Blocked rooms are shown with a "Blocked" badge but are never reported as available (F3)
- Clear empty state with a "Clear filters" button (F4)
- The result is cleared whenever the room, times or filters change (F5)
- Original rules preserved: valid time, 120-minute maximum, blocked room,
  overlap rules (touching bookings allowed), bookings never changed (AC1–AC5)
- Responsive layout that works on narrow and mobile screens (AC6)

## Requirements

- Node.js 18 or newer (includes npm)

## Setup and run

```bash
npm install        # install dependencies
npm run dev        # start the dev server, then open http://localhost:5173
```

## Tests

```bash
npm test           # run all automated tests once (Vitest)
```

Expected result:

```
 Test Files  4 passed (4)
      Tests  49 passed (49)
```

| Test file | What it covers |
|---|---|
| `src/domain/availability.test.ts` | AC1–AC5: valid time, 120 vs 121 minutes, blocked room, touching vs overlapping bookings, immutability |
| `src/domain/rooms.test.ts` | F1–F3: exact vs insufficient capacity, ALL equipment required, blocked room; attendees parsing; room-specific bookings |
| `src/domain/time.test.ts` | HH:MM parsing, "End at midnight" (24:00 = 1440) |
| `src/App.test.tsx` | UI behaviour: empty state, result cleared on room switch, A-201 vs C-310 results, filtered-out room, bookings unchanged |

## Other commands

```bash
npm run typecheck  # TypeScript type check (includes tests)
npm run lint       # ESLint
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  data/rooms.ts         fictional rooms and the fixed current time (NOW)
  domain/               pure TypeScript rules, no React
    time.ts             time constants and HH:MM parsing
    availability.ts     canBook() – AC1–AC4
    rooms.ts            room model, filters (F1–F3), checkRoomAvailability()
  components/           presentational React components (props in, JSX out)
  App.tsx               state, handlers and composition
  test/setup.ts         test setup (jest-dom matchers)
```

## Tech stack

React 18, TypeScript, Vite 5, Tailwind CSS, lucide-react icons;
Vitest, jsdom and Testing Library for tests.

## Known limitations

- The current time is fixed at 10:00 and only one day is supported.
- Rooms and bookings are hard-coded fictional data; no booking can be created.
- The responsive layout (AC6) is checked manually, not by automated tests.
