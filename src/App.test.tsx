import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

// ---------- helpers (they only find elements; all texts come from the components) ----------

function setup() {
  const user = userEvent.setup();
  render(<App />);
  return { user };
}

/** Room cards are toggle buttons; their accessible name starts with the room name. */
function roomButton(name: string) {
  return screen.getByRole("button", { name: new RegExp(`^${name}`) });
}

/** All room cards currently listed (each card has aria-pressed). */
function listedRooms() {
  return [
    ...screen.queryAllByRole("button", { pressed: true }),
    ...screen.queryAllByRole("button", { pressed: false }),
  ];
}

function checkButton() {
  return screen.getByRole("button", { name: "Check Availability" });
}

/**
 * Sets the start/end <input type="time"> values.
 * fireEvent.change is used because jsdom does not support typing into time inputs.
 */
function setTimes(start: string, end: string) {
  fireEvent.change(screen.getByLabelText("Start time"), { target: { value: start } });
  fireEvent.change(screen.getByLabelText("End time"), { target: { value: end } });
}

/** Text of each row in "Existing bookings for <room>". */
function bookingRows(roomName: string) {
  const heading = screen.getByRole("heading", { name: `Existing bookings for ${roomName}` });
  const section = heading.closest("section")!;
  return within(section)
    .getAllByRole("listitem")
    .map((li) => li.textContent);
}

// ---------- tests ----------

describe("App – filters and room list", () => {
  it("UI: initially all 5 rooms are listed and no room is selected", () => {
    setup();
    expect(screen.getByText("5 of 5 rooms match")).toBeInTheDocument();
    expect(listedRooms()).toHaveLength(5);
    expect(
      screen.getByText("Select a room above to check its availability.")
    ).toBeInTheDocument();
    expect(checkButton()).toBeDisabled();
  });

  it("F4: filters that match no room show the empty state, and Clear filters brings all 5 rooms back", async () => {
    const { user } = setup();

    // No room has both Computers and Video conferencing
    await user.click(screen.getByLabelText("Computers"));
    await user.click(screen.getByLabelText("Video conferencing"));

    expect(screen.getByText("No rooms match your requirements")).toBeInTheDocument();
    expect(screen.getByText("0 of 5 rooms match")).toBeInTheDocument();
    expect(listedRooms()).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.queryByText("No rooms match your requirements")).not.toBeInTheDocument();
    expect(screen.getByText("5 of 5 rooms match")).toBeInTheDocument();
    expect(listedRooms()).toHaveLength(5);
    expect(screen.getByLabelText("Computers")).not.toBeChecked();
    expect(screen.getByLabelText("Number of attendees")).toHaveValue(1);
  });

  it("F4: an invalid attendee count shows the error message and no rooms", async () => {
    const { user } = setup();
    const attendees = screen.getByLabelText("Number of attendees");

    await user.clear(attendees);
    await user.type(attendees, "0");

    expect(
      screen.getByText("Enter a whole number of attendees (1 or more).")
    ).toBeInTheDocument();
    expect(screen.getByText("No rooms match your requirements")).toBeInTheDocument();
  });

  it("F3: the blocked room is listed with a Blocked badge and is reported as Unavailable", async () => {
    const { user } = setup();
    const auditorium = roomButton("Auditorium D-001");
    expect(within(auditorium).getByText("Blocked")).toBeInTheDocument();

    await user.click(auditorium);
    setTimes("11:00", "12:00");
    await user.click(checkButton());

    const result = screen.getByRole("status");
    expect(result).toHaveTextContent("Unavailable");
    expect(result).toHaveTextContent(
      "This room is currently blocked and cannot be booked at any time."
    );
  });
});

describe("App – selection and availability result", () => {
  it("F5: after a check on Room A-201, selecting another room removes the result", async () => {
    const { user } = setup();

    await user.click(roomButton("Room A-201"));
    setTimes("12:30", "14:00");
    await user.click(checkButton());
    expect(screen.getByRole("status")).toHaveTextContent("Available");

    await user.click(roomButton("Lab B-105"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(roomButton("Lab B-105")).toHaveAttribute("aria-pressed", "true");
  });

  it("F5: changing a time after a check removes the result", async () => {
    const { user } = setup();

    await user.click(roomButton("Room A-201"));
    setTimes("12:30", "14:00");
    await user.click(checkButton());
    expect(screen.getByRole("status")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("End time"), { target: { value: "13:30" } });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("ROOM: 12:30–14:00 is Available for Room A-201 but Unavailable (Thesis Seminar) for Seminar C-310", async () => {
    const { user } = setup();
    setTimes("12:30", "14:00");

    await user.click(roomButton("Room A-201"));
    await user.click(checkButton());
    expect(screen.getByRole("status")).toHaveTextContent(
      "AvailableRoom A-201 is free for the requested window. No booking has been created."
    );

    await user.click(roomButton("Seminar C-310"));
    await user.click(checkButton());
    const result = screen.getByRole("status");
    expect(result).toHaveTextContent("Unavailable");
    expect(result).toHaveTextContent(
      "The requested time overlaps an existing booking (Thesis Seminar: 13:00–14:00)."
    );
  });

  it("ROOM: a selected room that gets filtered out is deselected and the Check button is disabled", async () => {
    const { user } = setup();

    await user.click(roomButton("Room A-201"));
    expect(checkButton()).toBeEnabled();
    expect(screen.getByText("Room A-201", { selector: "p.text-lg" })).toBeInTheDocument();

    // Room A-201 has capacity 30, so 31 attendees filters it out
    const attendees = screen.getByLabelText("Number of attendees");
    await user.clear(attendees);
    await user.type(attendees, "31");

    expect(screen.queryByRole("button", { name: /^Room A-201/ })).not.toBeInTheDocument();
    expect(
      screen.getByText("Select a room above to check its availability.")
    ).toBeInTheDocument();
    expect(checkButton()).toBeDisabled();
    expect(
      screen.queryByRole("heading", { name: /Existing bookings for/ })
    ).not.toBeInTheDocument();
  });

  it("AC5: the bookings list for Room A-201 is the same before and after a check", async () => {
    const { user } = setup();
    await user.click(roomButton("Room A-201"));

    const before = bookingRows("Room A-201");
    expect(before).toEqual([
      "Intro to Algorithms09:00 – 10:00",
      "Linear Algebra11:00 – 12:30",
      "Study Group14:00 – 15:00",
    ]);

    // One check that overlaps, one that is available
    setTimes("10:30", "12:30");
    await user.click(checkButton());
    expect(screen.getByRole("status")).toHaveTextContent("Unavailable");
    setTimes("12:30", "14:00");
    await user.click(checkButton());
    expect(screen.getByRole("status")).toHaveTextContent("Available");

    expect(bookingRows("Room A-201")).toEqual(before);
  });
});
