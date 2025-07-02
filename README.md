# 🏥 Appointment Booking in Doctor scheduler

This system handles booking appointments for doctors using **Wave** and **Stream** scheduling methods, based on the doctor’s preferred slot duration (10, 15, or 20 minutes).

---

## 📋 Features

- ✅ Book appointments with preferred doctors
- ✅ Supports **Stream** scheduling (exact sub-slot per patient)
- ✅ Supports **Wave** scheduling (multiple patients per block)
- ✅ Automatically assigns sub-slots or reporting times
- ✅ Prevents double-booking and enforces capacity

---

## 🧠 Scheduling Modes

### ⏱️ Stream Scheduling

- Each patient is assigned a **specific sub-slot** (e.g., 10-minute window).
- Sub-slots are **calculated dynamically** from the main time slot.
- Matches the **doctor’s preferred slot duration** exactly.

**Example:**
If the doctor prefers 10-minute slots and the main slot is 9:00–9:30:

- Patient 1 → 9:00–9:10  
- Patient 2 → 9:10–9:20  
- Patient 3 → 9:20–9:30  

### 🌊 Wave Scheduling

- **Multiple patients are booked at once** for the same time block.
- Reporting times are **staggered** using the preferred duration.
- Ideal for managing walk-ins or variable appointment times.

**Example:**
For a 30-minute slot (9:00–9:30) and 10-minute preference:

- 3 patients allowed (one every 10 mins)  
- All booked into the 9:00–9:30 slot  
- Reporting times: 9:00, 9:10, 9:20  

---

## ⚙️ Slot Booking Logic

### `bookAppointment(patient_id, dto: CreateAppointmentDto)`

1. **Validate Doctor & Patient**
2. **Check for duplicate bookings**
3. **Fetch matching slot**
4. **Based on doctor’s schedule type:**

#### Stream Mode
- Enforces sub-slot length = preferred duration
- Assigns next available sub-slot
- Updates `slot.current_bookings`
- Marks slot unavailable if full

#### Wave Mode
- Calculates `maxBookings = slot duration / preferred duration`
- Assigns next available reporting time
- Updates `slot.current_bookings`
- Marks slot unavailable if full

---

## 🛠 Helper Methods

```ts
getMinutesDifference(start: Date, end: Date): number {
    return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60);
}

addMinutesToTime(startTime: Date, minutes: number): Date {
    return new Date(new Date(startTime).getTime() + minutes * 60000);
}
