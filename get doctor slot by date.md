# Get Doctor Slot By Date (Backend API Only)

This document explains only the backend logic for getting available slots by passing `doctor_id` + `date` (and optional `hospital_id`, `phone`, `patient_id`), and what output you get back.

---

## 1) Backend route and controller function

Route mapping:

- [routes.php](file:///c:/xampp/htdocs/patientport-latest/api/application/config/routes.php#L526-L532)

```php
$route['get_available_slots'] = 'PublicHomeController/GetAvailableSlots';
```

Controller method:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2035-L2255)

Function:

- `public function GetAvailableSlots()`

---

## 2) Request: what you must pass

HTTP:

- Method: `POST` (the controller also reads GET/POST/JSON, but POST JSON is the intended usage)
- Path: `/get_available_slots`

Accepted fields (JSON body / POST / GET):

- `doctor_id` (required, integer > 0)
- `date` (required, string `YYYY-MM-DD`)
- `hospital_id` (optional, default `2`)
- `phone` (optional, digits only; triggers “already booked” check if length ≥ 10)
- `patient_id` (optional integer; only used when `phone` is provided)

Reference (input parsing + validation):

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2044-L2069)

Example request:

```json
{
  "hospital_id": 2,
  "doctor_id": 123,
  "date": "2026-04-08",
  "phone": "9999999999",
  "patient_id": 456
}
```

---

## 3) Response: what output you get

The endpoint has 3 main output cases.

### 3.1 Success: slots returned (`booked = false`)

Returned when:

- doctor is valid for that hospital, AND
- no existing appointment is found for (`hospital_id`, `doctor_id`, `date`, `phone`), OR `phone` not provided, AND
- schedule is found (event schedule or weekday/master schedule)

Response shape:

```json
{
  "success": true,
  "hospital_id": 2,
  "doctor_id": 123,
  "doctor": { "id": 123, "docuid": "DOC-UID", "name": "Dr Name" },
  "date": "2026-04-08",
  "weekday": "Wed",
  "source": "event",
  "count": 2,
  "slots": [
    {
      "id": 10,
      "title": "Appointment",
      "type": null,
      "notes": null,
      "start_time": "08:00:00",
      "end_time": "14:00:00",
      "time": "08:00:00",
      "max_appointments": 55,
      "book_slot": 0,
      "available_count": 55,
      "available": true,
      "period": "morning"
    }
  ],
  "booked": false
}
```

Where:

- `source` is `event` / `master` / `none`
- `available_count = max(0, max_appointments - book_slot)`
- `available = available_count > 0`
- `period` is inferred from `start_time` (`morning`/`afternoon`/`evening`)

### 3.2 Success: already booked (`booked = true`)

Returned when:

- `phone` is provided (length ≥ 10), AND
- a matching appointment exists for the same hospital + doctor + date (+ optional patient_id)

In this case:

- `slots` is empty
- `appointment` object is returned

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2072-L2132)

### 3.3 Failure: invalid input / doctor not found / errors

Common failures:

- Missing `doctor_id` or `date`
- Invalid date format (must be `YYYY-MM-DD`)
- Doctor not found or inactive for that hospital
- Internal exception (returns `success: false`)

References:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2053-L2069)
- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2134-L2148)
- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2249-L2254)

---

## 4) Core backend logic (Doctor + Date → Slots)

### 4.1 Inputs it expects

From JSON / POST / GET:

- `hospital_id` (default: 2)
- `doctor_id` (required)
- `date` (required, format `YYYY-MM-DD`)
- `phone` (optional)
- `patient_id` (optional)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2044-L2059)

### 4.2 Step A — Validate date

The server validates:

- date must match `Y-m-d`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2061-L2069)

It also computes:

- `$weekday = $dateObj->format('D')` (Mon, Tue, Wed…)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2070-L2071)

### 4.3 Step B — If phone is given, check if appointment already booked

If `phone` is present and length ≥ 10, it checks:

Table:

- `ms_patient_appointment`

Filter:

- `hospital_id`
- `doctor_id`
- `date`
- `phone`
- optional `patient_id`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2072-L2132)

If a row exists, the API returns:

- `booked: true`
- `count: 0`
- `slots: []`
- `appointment: { ... }` (includes token_no, times, names)

### 4.4 Step C — Resolve `docuid` from doctor record

The schedule tables use `docuid` (not doctor numeric id), so the API loads doctor row from:

Table:

- `ms_doctors`

Filter:

- `id = doctor_id`
- `hospital_id = hospital_id`
- `status = 1`
- `isdelete = 0`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2134-L2152)

### 4.5 Step D — Choose schedule source (Event schedule first, then master/weekday)

The API supports two schedule sources:

1) **Event schedule** (exact date override)  
2) **Master schedule** (weekday-based repeating schedule)

It sets `source`:

- `event` if event schedule exists for that exact date
- otherwise `master` if weekday schedule exists
- otherwise `none`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2153-L2229)

#### Event schedule (exact date)

Looks up the schedule row:

- `ms_doctor_event_schedules` filtered by:
  - `docuid`
  - `date`
  - `is_available = 1`

Then loads its slots from:

- `ms_doctor_event_slots` filtered by:
  - `event_id = schedule.id`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2153-L2192)

#### Master schedule (weekday-based fallback)

If no date event exists, it tries schedule by weekday.

Important: in this controller, the fallback schedule lookup is done in `ms_doctor_event_schedules` using `weekday`, and slots are loaded from `ms_doctor_time_slots` by `schedule_id`.

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2193-L2228)

Note: elsewhere in the codebase (staff save schedule), the weekly schedule table is `ms_doctor_schedules`, and its slots are `ms_doctor_time_slots` (see section 6.2). So, depending on your DB, your “master schedule” may be stored in `ms_doctor_schedules` (weekly) or also in `ms_doctor_event_schedules`. This document describes the exact queries used by `/get_available_slots`.

### 4.6 Step E — Compute availability per slot

For each slot row, the API calculates:

- `max_appointments`
- `book_slot` (either from the slot table column, or computed by counting appointments)
- `available_count = max(0, max_appointments - book_slot)`
- `available = available_count > 0`
- `period` inferred from slot `start_time`

Reference (event slot mapping):

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2170-L2191)

Reference (master slot mapping):

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2207-L2226)

Period inference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2257-L2266)

Booked appointment counting fallback (when `book_slot` column is missing):

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L415-L426)

---

## 5) Database tables involved (slot fetching)

When the user clicks date and the system fetches slots, these tables can be involved:

### 5.1 Always involved

1) `ms_doctors`  
Used to validate the doctor and resolve `docuid`.

Columns used:

- `id`
- `hospital_id`
- `docuid`
- `name`
- `status`
- `isdelete`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2134-L2152)

2) `ms_doctor_event_schedules`  
Used to find schedule rows for:

- exact `date` (event schedule)
- or `weekday` fallback (as implemented in this endpoint)

Columns used:

- `id`
- `docuid`
- `date` (for event)
- `weekday` (for fallback, if present in your schema)
- `is_available`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2153-L2205)

3) One of the slot tables, depending on `source`

If `source = event`:

- `ms_doctor_event_slots`

Columns used:

- `id`
- `event_id`
- `title`
- `type`
- `notes`
- `start_time`
- `end_time`
- `max_appointments`
- optional `book_slot`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2165-L2191)

If `source = master`:

- `ms_doctor_time_slots`

Columns used:

- `id`
- `schedule_id`
- `title`
- `type`
- `notes`
- `start_time`
- `end_time`
- `max_appointments`
- optional `book_slot`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2202-L2226)

### 5.2 Optional, depending on input / schema

4) `ms_patient_appointment`  
Used in two ways:

- To detect “already booked appointment for same date” (if `phone` provided)
- To compute booked count (fallback when `book_slot` is not present on slot tables)

Columns used in “already booked” check:

- `id`
- `appointment_uid`
- `hospital_id`
- `doctor_id`
- `patient_id` (optional filter)
- `patient_name`
- `phone`
- `date`
- `slot_id`
- `source`
- `start_time`
- `end_time`
- `token_no`

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2072-L2132)

Columns used in booked count:

- `slot_id`
- `doctor_id`
- `date`
- `source`
- `status` (excluding `cancelled`)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L415-L426)

5) `ms_hospitals` and `ms_doctors` (again)  
Only used when an existing appointment is found, to return display names.

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2088-L2130)

So, **slot fetching can touch 4–6 tables**, depending on:

- whether `phone` is provided,
- whether an appointment exists already,
- and whether schedule data is coming from event schedule or master schedule.

---

## 6) The exact queries (SQL equivalents)

The code uses CodeIgniter Query Builder. These are the equivalent SQL queries (approximate).

### 6.1 Check existing appointment (if phone provided)

```sql
SELECT *
FROM ms_patient_appointment
WHERE hospital_id = :hospital_id
  AND doctor_id = :doctor_id
  AND date = :date
  AND phone = :phone
  AND (:patient_id IS NULL OR patient_id = :patient_id)
LIMIT 1;
```

### 6.2 Doctor lookup to get `docuid`

```sql
SELECT *
FROM ms_doctors
WHERE id = :doctor_id
  AND hospital_id = :hospital_id
  AND status = 1
  AND isdelete = 0
LIMIT 1;
```

### 6.3 Event schedule by exact date

```sql
SELECT *
FROM ms_doctor_event_schedules
WHERE docuid = :docuid
  AND date = :date
  AND is_available = 1
LIMIT 1;
```

### 6.4 Event slots for that schedule

```sql
SELECT *
FROM ms_doctor_event_slots
WHERE event_id = :event_id;
```

### 6.5 Master/weekday schedule fallback (as implemented in `/get_available_slots`)

```sql
SELECT *
FROM ms_doctor_event_schedules
WHERE docuid = :docuid
  AND weekday = :weekday
  AND is_available = 1
LIMIT 1;
```

### 6.6 Master time slots

```sql
SELECT *
FROM ms_doctor_time_slots
WHERE schedule_id = :schedule_id;
```

### 6.7 Booked count fallback (if slot table doesn’t have `book_slot`)

```sql
SELECT COUNT(*) AS booked
FROM ms_patient_appointment
WHERE slot_id = :slot_id
  AND doctor_id = :doctor_id
  AND date = :date
  AND source = :source
  AND status <> 'cancelled';
```

---

## 8) Extra: where weekly schedules and event schedules are created (Admin/Staff side)

This helps you understand where the data in those tables comes from.

### 8.1 Saving event schedule (date-specific)

Staff API saves date-specific schedule into:

- `ms_doctor_event_schedules` (docuid + date)
- `ms_doctor_event_slots` (event_id + slot details)

Reference:

- [SFStaffController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/SFStaffController.php#L2604-L2740)

### 8.2 Saving weekly schedule (master schedule)

Staff API saves weekly repeating schedule into:

- `ms_doctor_schedules` (docuid + weekday)
- `ms_doctor_time_slots` (schedule_id + slot details)

Reference:

- [SFStaffController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/SFStaffController.php#L620-L669)

---

## 9) Quick backend summary (end-to-end)

1) Receive request `{ hospital_id?, doctor_id, date, phone?, patient_id? }`  
2) Validate `date` format and derive `weekday` (`Mon/Tue/...`)  
3) If `phone` present (≥ 10 digits): check `ms_patient_appointment` for existing appointment on same date  
4) Load doctor from `ms_doctors` to get `docuid` and ensure doctor is active for hospital  
5) Try schedule in this order:
   - event schedule by exact date (`ms_doctor_event_schedules` + `ms_doctor_event_slots`)
   - fallback schedule by weekday (`ms_doctor_event_schedules` + `ms_doctor_time_slots`)  
6) For each slot: compute `available_count` and `available`, infer `period`, return JSON response

---

## 10) Tables and columns used (backend)

Total tables involved in `/get_available_slots`:

- Minimum: 3 tables (doctor + schedule + slots)
- Typical: 4 tables (adds `ms_patient_appointment` for availability counting or “already booked” check)
- Maximum: 6 tables (when “already booked” is found and hospital/doctor names are also fetched)

### 10.1 `ms_doctors` (required)

Used for:

- Validate doctor belongs to hospital and is active
- Resolve `docuid` (used to find schedules)

Columns used by this endpoint:

- `id` (filter)
- `hospital_id` (filter)
- `status` (filter)
- `isdelete` (filter)
- `docuid` (output + used for schedule lookups)
- `name` (output)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2134-L2152)

### 10.2 `ms_doctor_event_schedules` (required)

Used for:

- Event schedule lookup by exact date
- Fallback schedule lookup by weekday (as implemented in this endpoint)

Columns used by this endpoint:

- `id` (to load slots)
- `docuid` (filter)
- `date` (filter for event schedule)
- `weekday` (filter for fallback schedule, if present in DB)
- `is_available` (filter)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2153-L2205)

### 10.3 `ms_doctor_event_slots` (used when `source = event`)

Used for:

- Get the time slots for a date-specific schedule (`event_id = schedule.id`)

Columns used by this endpoint:

- `id`
- `event_id` (filter)
- `title`
- `type`
- `notes`
- `start_time`
- `end_time`
- `max_appointments`
- `book_slot` (optional; if missing, fallback to counting appointments)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2165-L2191)

### 10.4 `ms_doctor_time_slots` (used when `source = master`)

Used for:

- Get the time slots for a “master”/weekday schedule (`schedule_id = schedule.id`)

Columns used by this endpoint:

- `id`
- `schedule_id` (filter)
- `title`
- `type`
- `notes`
- `start_time`
- `end_time`
- `max_appointments`
- `book_slot` (optional; if missing, fallback to counting appointments)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2202-L2226)

### 10.5 `ms_patient_appointment` (optional but common)

Used for:

1) “Already booked” check (only when `phone` is provided and length ≥ 10)  
2) Counting booked tokens for a slot/date (only when `book_slot` column is missing in slot tables)

Columns used by this endpoint:

- `hospital_id` (filter in “already booked” check)
- `doctor_id` (filter)
- `patient_id` (optional filter)
- `phone` (filter)
- `date` (filter)
- `slot_id` (filter for counting)
- `source` (filter for counting + output for booked appointment)
- `status` (exclude `cancelled` when counting)
- `id` (output for booked appointment)
- `appointment_uid` (output for booked appointment)
- `patient_name` (output for booked appointment)
- `start_time` (output for booked appointment)
- `end_time` (output for booked appointment)
- `token_no` (output for booked appointment)

References:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2072-L2132)
- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L415-L426)

### 10.6 `ms_hospitals` (only when “already booked” is found)

Used for:

- Return `hospital_name` in the `appointment` object for already booked case

Columns used by this endpoint:

- `id` (filter)
- `hospital_name` (output if present)
- `name` (fallback output)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2088-L2092)

### 10.7 `ms_doctors` (again, only when “already booked” is found)

Used for:

- Return `doctor_name` in the `appointment` object for already booked case

Columns used by this endpoint:

- `id` (filter)
- `name` (output)

Reference:

- [PublicHomeController.php](file:///c:/xampp/htdocs/patientport-latest/api/application/controllers/PublicHomeController.php#L2090-L2093)
