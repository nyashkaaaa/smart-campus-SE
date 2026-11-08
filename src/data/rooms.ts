// Fictional demo data. No database or API: this file is the single source of truth.
import type { Room } from "@/rooms";

/** Current time, fixed at 10:00 for predictable demonstration/testing. */
export const NOW = 600;

export const ROOMS: readonly Room[] = [
  {
    id: "A-201",
    name: "Room A-201",
    capacity: 30,
    equipment: ["Projector", "Whiteboard"],
    blocked: false,
    bookings: [
      { id: "A-201-1", start: 9 * 60, end: 10 * 60, label: "Intro to Algorithms" },
      { id: "A-201-2", start: 11 * 60, end: 12 * 60 + 30, label: "Linear Algebra" },
      { id: "A-201-3", start: 14 * 60, end: 15 * 60, label: "Study Group" },
    ],
  },
  {
    id: "B-105",
    name: "Lab B-105",
    capacity: 20,
    equipment: ["Computers", "Projector"],
    blocked: false,
    bookings: [
      { id: "B-105-1", start: 10 * 60 + 30, end: 12 * 60, label: "Programming Lab" },
      { id: "B-105-2", start: 16 * 60, end: 17 * 60, label: "Database Lab" },
    ],
  },
  {
    id: "C-310",
    name: "Seminar C-310",
    capacity: 12,
    equipment: ["Whiteboard", "Video conferencing"],
    blocked: false,
    bookings: [
      { id: "C-310-1", start: 13 * 60, end: 14 * 60, label: "Thesis Seminar" },
    ],
  },
  {
    id: "D-001",
    name: "Auditorium D-001",
    capacity: 120,
    equipment: ["Projector", "Video conferencing", "Whiteboard"],
    blocked: true,
    bookings: [],
  },
  {
    id: "E-402",
    name: "Study Room E-402",
    capacity: 6,
    equipment: ["Whiteboard"],
    blocked: false,
    bookings: [],
  },
];
