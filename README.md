# T&P Task Automation

> A role-based placement and training management system for **Thakur College of Engineering and Technology**. Automates student categorization, placement tracking, training attendance, internship management, and reporting across multiple user roles.

## Table of Contents

- [Architecture](#architecture)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Docker)](#quick-start-docker)
  - [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [API Overview](#api-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

```
┌─────────┐    ┌──────────────────┐    ┌───────────┐
│  Caddy   │───▶│  Django REST API │───▶│  MySQL    │
│ (reverse │    │  (Gunicorn)      │    │           │
│  proxy)  │    │                  │    └───────────┘
└─────────┘    │  + Celery         │    ┌───────────┐
       │       └──────────────────┘───▶│  Redis    │
       │                               │ (broker)  │
       │                               └───────────┘
  React SPA
(Vite + MUI)
```

The system serves a React SPA via Django templates (production build) while exposing a RESTful JSON API for frontend-backend communication. Background tasks (Excel/Resume exports, notifications) are handled by Celery with Redis as the message broker.

---

## User Roles

| Role | Access |
|------|--------|
| **System Admin** | Full admin panel (django-unfold), user management, system configuration |
| **Principal** | Top-level oversight, aggregate reports |
| **Training Officer** | Training attendance & performance data upload per program |
| **Placement Officer** | Placement dashboards, category rules, company tracking, branch reports |
| **Internship Officer** | Internship company registration, notices, offer management |
| **Faculty Coordinator** | Manages assigned programs (ACT, SDP, Coding contests) |
| **Staff** | Company registration, notices, eligible student lists, progress tracking |
| **Student** | Profile, resume builder, placement card, training performance, internship applications |

---

## Getting Started

### Prerequisites

- **Python 3.12+**
- **MySQL 8+**
- **Redis** (for Celery task queue)
- **Node.js 18+** (for frontend development)

### Quick Start (Docker)

```bash
# Clone the repo
git clone <repo-url> && cd t_and_p_task_automation

# Copy and edit environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

The app will be available at `http://localhost`. A superuser is auto-created from `.env` credentials.

### Manual Setup

**Backend:**

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Create MySQL database
mysql -u root -e "CREATE DATABASE t_and_p_automation;"

# Migrate and seed
python manage.py migrate
python manage.py createsuperuser

# Start dev server
python manage.py runserver
```

**Frontend (development mode):**

```bash
cd client_app
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` with API proxied to Django.

---

## Configuration

All configuration is via environment variables (`.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_NAME` | `t_and_p_automation` | MySQL database name |
| `DATABASE_USER` | `t_and_p` | MySQL user |
| `DATABASE_PASSWORD` | — | MySQL password |
| `DATABASE_ROOT_PASSWORD` | — | MySQL root password |
| `EMAIL_USERNAME` | — | Gmail SMTP username (for OTP/notifications) |
| `EMAIL_PASSWORD` | — | Gmail app password |
| `ENV` | `DEV` | `DEV` or `PROD` — controls debug mode, CORS, DB host |
| `CLIENT_URL` | `http://localhost` | Frontend URL for CORS |
| `CURRENT_HOST` | `localhost` | Allowed host (for non-Docker dev) |
| `DJANGO_SUPERUSER_EMAIL` | `admin@gmail.com` | Auto-created superuser email |
| `DJANGO_SUPERUSER_PASSWORD` | `admin123` | Auto-created superuser password |

---

## API Overview

The backend exposes a RESTful API under `/api/`. Key namespaces:

| Prefix | Module | Purpose |
|--------|--------|---------|
| `/auth/` | `base` | Login, password reset with OTP, logout |
| `/api/student/` | `student` | Profile, resume, attendance data, placement card, training performance |
| `/api/placement_officer/` | `placement_officer` | Dashboards, category stats, branch reports, consent analytics |
| `/api/training_officer/` | `training_officer` | Training data management |
| `/api/program_coordinator/` | `program_coordinator_api` | Attendance upload, training performance upload, student analytics |
| `/api/internship/` | `internship_api` | Company registration, offers, internship applications |
| `/api/faculty_coordinator/` | `faculty_coordinator` | Faculty-managed program data |
| `/api/staff/` | `staff` | Company CRUD, notices, student progress, Excel/Resume export tasks |
| `/api/notifications/` | `notifications` | Notification CRUD |

See individual `urls.py` files in each app for full endpoint details.

---

## Key Features

### Student Categorization
Automatically classifies students into **Green / Yellow / Orange / Red** categories based on academic attendance, academic performance, training attendance, and training performance using configurable `CategoryRule` thresholds per batch.

### Placement Pipeline
- Company registration with eligibility criteria (10th, 12th, CGPA, KT policy)
- Student consent collection (placement / higher studies / entrepreneurship)
- Application tracking per company with progress stages (registered → aptitude → coding → tech interview → HR → final result)
- Dashboard with placements over time, salary distribution, department performance, top recruiters

### Training Management
- Upload training performance via Excel templates
- Per-category marks (Arithmetic, OS, Aptitude, etc.) with configurable training types (ACT_Technical, ACT_Aptitude, Coding_Contest, SDP)
- Attendance record management across sessions, phases, and semesters

### Resume Builder
Students can build and export resumes with sections for contact, skills, work experience, education, projects, and achievements.

### Notification System
Targeted notifications with file attachments, created by authorized roles and received by specific users.

### Background Tasks
Async Excel and resume export using Celery + Redis. Poll task status via `/api/staff/task-status/<task_id>/`.

### Admin Panel
Modern admin interface powered by [django-unfold](https://github.com/unfoldadmin/django-unfold) with custom navigation, role-based sidebar.

---

## Tech Stack

**Backend:** Django 5.1, Django REST Framework, Celery, MySQL, Redis  
**Frontend:** React 18, TypeScript, Vite, Material UI, Tailwind CSS, Radix UI, TanStack Query, Recharts  
**Infrastructure:** Docker, Docker Compose, Gunicorn, Caddy (reverse proxy)  
**Tooling:** django-import-export, django-cors-headers, django-cotton, django-tailwind, WeasyPrint (PDF generation)

---

## Project Structure

```
t_and_p_task_automation/
├── t_and_p_automation/    # Django project config (settings, URLs, Celery)
├── base/                  # Custom User model, auth views (login, OTP reset)
├── student/               # Student model, resume, offers, placement card
├── placement_officer/     # Dashboards, category rules, reports
├── training_officer/      # Training officer views
├── program_coordinator_api/  # Attendance & training performance management
├── internship_api/        # Internship registration, applications, offers
├── faculty_coordinator/   # Faculty program management
├── staff/                 # Company CRUD, notices, exports, student updates
├── department_coordinator/ # Department-level coordination
├── notifications/         # Notification model + API
├── client_app/            # React SPA (Vite + MUI)
├── templates/             # Django templates (base + React build index)
├── static/                # Static assets
├── Dockerfile             # Multi-stage: frontend build → Python runtime
├── docker-compose.yml     # MySQL + Redis + Backend + Caddy
├── Caddyfile              # Reverse proxy config
└── entrypoint.sh          # Container entry: wait for DB → migrate → seed → gunicorn
```

---

## Troubleshooting

**Database connection errors on first run**  
Use Docker (the `entrypoint.sh` script waits for MySQL to be ready). For manual setup, ensure MySQL is running and the database exists.

**Frontend not loading / API 404**  
The React SPA is served at the root. Ensure the frontend build exists (`client_app/build/`) or run Vite dev server on port 5173. In dev mode, CORS is enabled for `localhost:5173`.

**OTP emails not sending**  
Set `EMAIL_USERNAME` and `EMAIL_PASSWORD` in `.env` with a Gmail app password (not your regular password). Check that "Less secure app access" or 2FA app password is configured.

**Celery tasks stuck**  
Verify Redis is running on port 6379. Start a Celery worker: `celery -A t_and_p_automation worker --loglevel=info`.

---

## Contributing

PRs are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

Internal use — Thakur College of Engineering and Technology.
