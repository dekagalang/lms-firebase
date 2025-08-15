# SchoolMS v2 — React + Vite + Firebase (Auth + Firestore)
Full starter with:
- Google Auth + protected routes
- CRUD: Students, Teachers, Classes
- Placeholders: Schedule, Attendance, Grades, Finance, Reports, Settings
- Tailwind UI + simple DataTable
## Quick start
```bash
pnpm i        # or npm i / yarn
cp .env.example .env
# Fill Firebase credentials in .env
pnpm dev
```
## Firebase
- Enable Authentication (Google)
- Create Firestore (Native mode)
- (Optional) Deploy rules: `firebase deploy --only firestore:rules`
## Collections
- students: { fullName, nisn, gradeLevel, className, parentName, parentPhone, status }
- teachers: { fullName, email, phone, subjects, status }
- classes: { className, gradeLevel, homeroomTeacher, capacity }
