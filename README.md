# C. V. Raman Global University (CVRGU) Online Examination System

A modern, professional, secure Online Examination System frontend for **C. V. Raman Global University (CVRGU), Bhubaneswar, Odisha, India**.

Built with React 19, Vite, Tailwind CSS, Lucide Icons, Context API, and a modular service layer ready for full-scale Node.js / Express / MongoDB university backend integration.

---

## 🏛️ University Identity & Institutional Branding

* **Institution Name:** C. V. Raman Global University
* **Short Name:** CVRGU
* **Location:** Bhubaneswar, Odisha, India
* **Authorized Email Domains:** `@cgu-odisha.in` (Primary) / `@cgu-odisha.ac.in`
* **Brand Colors:**
  * Deep Navy: `#06264A`
  * Dark Navy: `#031A33`
  * Gold / Accent: `#F5A623`
  * Success Green: `#16A34A`
  * Warning Orange: `#F59E0B`
  * Error Red: `#DC2626`
  * Light Gray: `#F5F7FA`

---

## 🛠️ Technology Stack

* **Frontend Library:** React 19 (`^19.2.8`) & React DOM
* **Build Tool & Bundler:** Vite 8 (`^8.3.0`)
* **Routing:** React Router DOM v7 (`^7.18.4`)
* **Styling:** Tailwind CSS (`^3.4.19`) with PostCSS & Autoprefixer
* **Icons:** Lucide React (`^1.47.0`)
* **Spreadsheet Processing:** XLSX (`^0.18.5`) for Excel & CSV parsing/template generation
* **HTTP Client:** Axios (`^1.20.0`) with interceptors and mock persistence
* **Visual Effects:** Canvas Confetti (`^1.9.4`)
* **Linter:** Oxlint (`^1.81.0`)

---

## 🚀 Installation & Local Development

### Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Lint Check
```bash
npm run lint
```

---

## 🔑 Institutional Demo Accounts

Pre-seeded demonstration credentials (zero personal names):

| Role | Email | Password | Institutional Title |
| :--- | :--- | :--- | :--- |
| **Student** | `student@cgu-odisha.in` | `Password@123` | Student Name (`XXX XXXXXXX`, CSE Department) |
| **Admin** | `admin@cgu-odisha.ac.in` | `Admin@123` | Examination Controller (Office of the COE) |

*(Quick-fill demo buttons are provided on the Login page for 1-click access).*

---

## 🌐 Environment Variables Configuration

The application uses standard Vite public environment variables configured in `.env`:

```env
VITE_APP_NAME="CVRGU Online Examination System"
VITE_UNIVERSITY_NAME="C. V. Raman Global University"
VITE_UNIVERSITY_SHORT="CVRGU"
VITE_UNIVERSITY_LOCATION="Bhubaneswar, Odisha, India"
VITE_AUTHORIZED_DOMAIN="cgu-odisha.in"
VITE_AUTHORIZED_DOMAIN_AC="cgu-odisha.ac.in"
VITE_API_BASE_URL="http://localhost:5000/api"
VITE_PROCTORING_MAX_STRIKES=3
```

---

## 📁 Project Architecture & Directory Layout

```text
d:/SOFTWARE/
├── public/
│   ├── favicon.svg                  # CVRGU university favicon
│   └── icons.svg                    # SVG sprite definitions
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Top navigation with emblem & notifications
│   │   ├── Sidebar.jsx              # Responsive navigation sidebar
│   │   ├── ExamCard.jsx             # Exam card with section count & retest badges
│   │   ├── ExamTimer.jsx            # Resilient countdown timer with critical state
│   │   ├── SectionStatusBar.jsx     # Visual pipeline of locked, active & future sections
│   │   ├── QuestionCard.jsx         # Question statement and options renderer
│   │   ├── QuestionNavigator.jsx    # Section-filtered palette (Answered, Review, etc.)
│   │   ├── SecurityIndicator.jsx    # Strike tracker badge (0/3, 1/3, 2/3)
│   │   ├── SecurityWarningModal.jsx # Warning modal on proctoring strike 1 and 2
│   │   ├── SubmitModal.jsx          # Irreversible section lock & final submit dialog
│   │   ├── RetestRequestModal.jsx   # Student formal appeal petition to COE
│   │   ├── ProtectedRoute.jsx       # Student and Admin route guards
│   │   │
│   │   └── admin/
│   │       ├── AddEditSectionModal.jsx    # Create/edit section (name, order, duration)
│   │       ├── DeleteSectionModal.jsx     # Safe deletion with question relocation workflow
│   │       ├── SectionQuestionsDrawer.jsx # Slide-over drawer to view & curate questions
│   │       ├── BulkUploadModal.jsx        # Excel/CSV upload with section binding & preview
│   │       ├── QuestionEditorModal.jsx    # Split-screen editor with live student preview
│   │       └── MoveQuestionModal.jsx      # Single & bulk section re-assignment dialog
│   │
│   ├── pages/
│   │   ├── Landing.jsx              # University homepage & accreditation showcase
│   │   ├── Login.jsx                # Domain-restricted login (@cgu-odisha.in)
│   │   ├── Register.jsx             # Student registration with neutral placeholders
│   │   ├── StudentDashboard.jsx     # Available exams, retest notices, progress metrics
│   │   ├── MyExams.jsx              # Tabbed roster (Available, Upcoming, Retests, Completed)
│   │   ├── ExamInstructions.jsx     # Section breakdown table & locking protocol declaration
│   │   ├── ExamPage.jsx             # Fullscreen examination room with anti-cheat engine
│   │   ├── ResultPage.jsx           # Statement of Marks with section-wise performance
│   │   ├── ResultHistory.jsx        # Academic transcripts with Attempt column
│   │   ├── Profile.jsx              # Verified student enrollment credentials
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx   # Controller metrics, quick navigation cards
│   │       ├── ManageStudents.jsx   # Enrolled student roster & status toggle
│   │       ├── ManageExams.jsx      # Exam catalog CRUD & publishing control
│   │       ├── ManageSections.jsx   # EXAMINATION STRUCTURE: Drag-and-drop section ordering
│   │       ├── ManageQuestions.jsx  # Question Bank with bulk upload, search, numbering
│   │       ├── ManageResults.jsx    # University-wide grading logs & section score audit
│   │       ├── ManageRetests.jsx    # COE console for adjudicating retest petitions
│   │       └── ManageMonitoring.jsx # Live telemetry, candidate proctoring, remote termination
│   │
│   ├── context/
│   │   ├── AuthContext.jsx          # Session state, login/logout, role protection
│   │   └── ExamContext.jsx          # Section engine, timers, answer state, auto-submission
│   │
│   ├── hooks/
│   │   └── useExamSecurity.js       # Centralized proctoring hook (visibility, blur, fullscreen)
│   │
│   ├── services/
│   │   ├── api.js                   # Axios client with interceptors & mock persistence
│   │   ├── authService.js           # Authentication endpoints & session management
│   │   ├── studentService.js        # Student roster & verification
│   │   ├── userService.js           # Legacy user methods
│   │   ├── examService.js           # Examination CRUD & publishing
│   │   ├── sectionService.js        # Section management, reordering, relocation
│   │   ├── questionService.js       # Question Bank CRUD & section assignment
│   │   ├── resultService.js         # Score evaluation & section-wise grading
│   │   ├── retestService.js         # Retest appeals & COE adjudication
│   │   ├── monitoringService.js     # Live telemetry & active exam sessions
│   │   └── notificationService.js   # University bulletins & advisories
│   │
│   ├── utils/
│   │   ├── constants.js             # Theme colors, departments, initial seed data
│   │   ├── validation.js            # Centralized email domain validator (@cgu-odisha.in)
│   │   ├── examSecurity.js          # Fullscreen helpers & violation descriptors
│   │   └── questionImporter.js      # Template generator, sheet parser, duplicate detector
│   │
│   ├── App.jsx                      # Master routing tree with protected portals
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Tailwind CSS directives & custom utility classes
├── package.json
└── README.md
```

---

## 🔒 Complete Workflow Descriptions

### 1. Student Examination Workflow
1. **Login:** Student logs in using official email ending in `@cgu-odisha.in` or `@cgu-odisha.ac.in`.
2. **Dashboard & Selection:** Student reviews active exams and clicks **Start Examination**.
3. **Instructions & Honor Code:** Displays section breakdown, independent section timers, and anti-cheat policies. Student checks agreement and enters the exam.
4. **Sequential Section Locking:**
   * Exam enters fullscreen.
   * Only **Section 1** is active and timed. Future sections remain locked.
   * When Section 1 timer reaches `00:00` or candidate manually clicks **Submit Section**, Section 1 is **permanently locked**.
   * Answers in Section 1 can never be modified again.
   * **Section 2** activates with its own independent countdown timer.
5. **Final Submission:** Concluding the final section closes the session and calculates scores.
6. **Result Card:** Student inspects overall score, percentage, Pass/Fail seal, and section-by-section breakdown.

---

### 2. Administrator & COE Workflow
1. **Exam Configuration:** Create subject papers, duration, passing marks, and published status.
2. **Examination Structure (`/admin/sections`):**
   * Create named sections (e.g. *Aptitude*, *Logical Reasoning*, *Technical*).
   * Reorder sections via drag-and-drop or directional arrows. The order directly controls the student's exam progression.
   * Safe deletion: Deleting a section with questions prompts question relocation to another section before deletion.
3. **Question Bank Management (`/admin/questions`):**
   * Manual split-screen editor with real-time student preview.
   * Single-click answer picking (A, B, C, D).
   * Move individual or bulk questions across sections.
4. **Live Proctoring Monitoring (`/admin/monitoring`):**
   * View live candidates in exam rooms, heartbeat telemetry, and active strikes.
   * Remote force-submit capability for candidates violating exam rules.

---

### 3. Bulk Question Upload Workflow
1. Authority downloads the standard university `.xlsx` or `.csv` template.
2. File or clipboard paste is processed:
   * **Validation:** Verifies required fields, question statement, 4 options, valid correct answer, and positive marks.
   * **Section Auto-Detection:** Automatically matches sections to existing exam sections (case-insensitive) or creates missing sections.
   * **Duplicate Detection:** Compares question statements using string similarity to flag potential duplicates.
3. **Pre-Import Preview:** Shows summary stats, question list, flagged syntax issues, and duplicates before confirming.
4. **Confirmation:** On clicking **Confirm Import**, questions are atomically committed and linked to the respective `sectionId`.

---

### 4. Retest Authority Architecture
* **No Student Self-Retake:** Students cannot retake exams on their own.
* **Formal Petitions:** If an unexpected technical disruption occurs (lab outage, browser crash), the student files an official appeal with narrative grounds and incident tags.
* **Controller Adjudication:** COE evaluates telemetry and either:
  * **Approves:** Specifies attempt limit (Attempt 2), authorized attempt window (e.g. Next 48 Hours), and generates an official authorization code (`COE/CVRGU/RET-2026/...`).
  * **Rejects:** Logs official rejection remarks.
* **Multi-Attempt History:** Each attempt is saved as a discrete record (`Attempt 1`, `Attempt 2`), preserving audit trails without overwriting past attempts.

---

### 5. Exam Security & Limitations Disclaimer
The frontend implements an active **Audit, Detect, Warn & Auto-Submit** engine:
* Tab-switch and window minimization detection via `document.visibilitychange`.
* Window focus tracking via `window.blur` with 1000ms debounce.
* Fullscreen escape tracking via `fullscreenchange`.
* **3-Strike System:** Violations 1 & 2 show warnings; Strike 3 immediately auto-submits the exam.

> **Security Boundary Advisory:**  
> A client-side web application operates in an untrusted browser environment. While the frontend provides thorough anti-cheat monitoring, a production deployment **must** enforce question distribution, timer deadlines, submission validity, section locking, and retest authorization on the backend server.
#   c g u - e x a m - p o r t a l  
 