# Lunario

Lunario is a menstrual cycle diary for Android. You log your period, see the month, and the app estimates your next period, ovulation, and fertile window. It is a personal record, not a contraceptive method. Dates are estimates from your own cycles.

Cycle data stays on the phone. There is no account.

## MVP

The smallest version worth publishing:

- **Onboarding.** Date of the last period, usual cycle length (default 28), and usual bleeding length (default 5).
- **Month calendar.** Period days, predicted period, ovulation, and fertile window. The fertile window can be hidden.
- **Log.** Period start and end, flow intensity, symptoms (pain, mood, discharge), and a note.
- **Prediction.** Average of recent complete cycles. Ovulation is estimated 14 days before the next period. The fertile window runs from 5 days before ovulation through 1 day after.
- **History.** Length of each cycle, and the average.
- **Reminder.** A local notification a few days before the estimated period.
- **On-device data.** No account. Delete everything, and export a file.

The interface is entirely in English.

## Out of scope

Cloud sync, accounts, partner sharing, widgets, iOS, a PIN or biometrics, charts, encrypted backup, and any medical or contraceptive claim. iOS can reuse this codebase later if it is worth shipping.

## Privacy

Cycle data is health data. In the MVP it never leaves the device: SQLite on the phone, no third-party analytics, no crash reporting SDK, and no login.

Play Store requires a privacy policy and a Data safety form. The form should state that health information is not collected on servers and is not shared. The only runtime permission is notifications.

## Stack

Expo (managed workflow) with React Native and TypeScript.

| Piece | Choice |
| --- | --- |
| Navigation | expo-router |
| Storage | expo-sqlite (async API) |
| Reminders | expo-notifications, local only |
| Dates | date-fns, stored as `YYYY-MM-DD` |
| Export | expo-file-system and expo-sharing |
| Store build | EAS Build, signed AAB |
| Tests | Jest on the prediction functions |
| UI | A custom month grid and StyleSheet. No UI kit and no calendar library |

SQLite is the source of truth. Screen state lives in hooks. Do not add Firebase, analytics, or any SDK that contacts a server.

Dates are local calendar days, never timestamps, so a cycle does not shift across time zones.

## Data model

Three tables.

**settings.** Default cycle length (28), default bleeding length (5), whether to show the fertile window, whether the reminder is on and how many days before, and whether onboarding is complete.

**cycles.** Unique `start_date`. `end_date` is null while the period is still open. Cycle length is not stored. It is the distance from this start to the next start.

**logs.** One row per date. Flow (`spotting`, `light`, `medium`, `heavy`), pain, mood, discharge, and a note. Symptoms can exist on days that are not period days.

## Prediction

Prediction is a pure function, covered by tests before the UI depends on it.

- Estimated cycle length is the rounded average of the last 6 complete cycles. With no history, use the onboarding default.
- Estimated bleeding length is the average of closed periods, or the onboarding default.
- Next period start is the last start plus the estimated length. If that date has passed and no new period was logged, it stays marked as late. It does not move forward on its own.
- Ovulation is 14 days before that next start.
- The fertile window is 5 days before ovulation through 1 day after. It can be hidden.
- A confirmed period is painted from start through end. An open period is painted from start through today.
- The reminder is a local, inexact notification. It is rescheduled whenever a cycle changes. Exact-alarm permission is not required.

## Screens

1. **Onboarding**, first launch only. Last period date, cycle length, bleeding length.
2. **Month.** Grid colored for period, prediction, ovulation, and fertile window. A tap opens the day.
3. **Day.** Start or end the period, flow, symptoms, and a note.
4. **History.** Each closed cycle with its length, plus the average.
5. **Settings.** Fertile window, reminder, export JSON, delete all, and the note that dates are estimates.

## Phases

**Base.** Expo app in this repo, SQLite schema, onboarding, and a calendar with prediction. Run it on a phone with Expo Go.

**Diary.** Symptoms, notes, history, export, delete all, and the reminder.

**Release.** Icon, a public privacy policy URL, Data safety, an English store listing, and a signed AAB from EAS. Requires a Play Console account. The only permission is notifications.

**Later.** PIN lock, charts, encrypted backup, and iOS from the same Expo project.
