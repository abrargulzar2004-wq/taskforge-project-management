# TaskForge — Project Management & Team Collaboration Platform

TaskForge is a full-stack Project Management & Team Collaboration platform built for organizations to plan projects, assign tasks, manage teams, and track progress from a single system. It simulates real-world software used by companies to manage projects and collaborate across teams, with role-based access control across three dedicated portals.

**Live Demo:** https://taskforge-project-management.onrender.com/
**Repository:** https://github.com/abrargulzar2004-wq/taskforge-project-management

---

## Tech Stack

- **Backend:** Laravel (PHP), REST API, Sanctum authentication
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** MySQL
- **Deployment:** Render (backend + frontend), GitHub-integrated CI

---

## Portals & Roles

### 🛡️ Administrator Portal
- Full control over the system
- Create, update, and manage users
- Create, update, and manage projects
- Assign a Project Manager to each project
- Assign/remove team members on any project
- Monitor all projects and progress
- View system-wide reports and analytics

### 📋 Project Manager Portal
- View and manage only assigned projects
- Add or remove team members from assigned projects
- Create and assign tasks to team members
- Set task priority and deadlines
- Monitor task and project progress
- View task discussions and project updates

### ✅ Team Member Portal
- View assigned projects and tasks
- Update task status (To Do → In Progress → Review → Completed)
- Participate in task discussions
- View notifications
- Manage personal profile

---

## Core Features

- **Authentication & Authorization** — Sanctum-based auth with role-based route protection (`admin`, `project_manager`, `team_member`)
- **Project Management** — name, description, dates, priority, status, assigned manager & members, progress tracking
- **Task Management** — title, description, assignee, priority, due date, status lifecycle
- **Task Discussion** — per-task comment thread for Project Managers and assigned Team Members
- **Notifications** — task assignment, status changes, new discussion messages, upcoming deadlines
- **Dashboards** — role-specific metrics (active projects, pending/overdue tasks, completion %, upcoming deadlines)
- **Calendar View** — visualize deadlines and due dates by month
- **Reports** — project/task/productivity reporting with CSV and PDF export (Admin)
- **Search, Filter & Sort** — across users, projects, and tasks
- **Activity Log** — tracks key actions (project created, member assigned, etc.)

---

## Project Structure

```
taskforge-project-management/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── Admin/          # Admin-only controllers (Users, Projects, Reports)
│   │   ├── Manager/        # Project Manager controllers (Projects, Tasks, Reports)
│   │   ├── Member/         # Team Member controllers (Tasks)
│   │   └── ...             # Shared controllers (Auth, Notifications, Profile, Comments)
│   └── Models/              # Eloquent models (User, Project, Task, etc.)
├── database/                # Migrations, seeders, factories
├── routes/api.php           # Versioned API routes (/api/v1/...)
├── frontend/
│   ├── src/
│   │   ├── pages/           # Role-based pages (admin/, manager/, member/)
│   │   ├── components/      # Shared UI components
│   │   └── index.css        # Tailwind v4 theme
│   └── vite.config.js
└── docker/                  # Deployment configuration
```

---

## Getting Started (Local Setup)

### Backend

```bash
git clone https://github.com/abrargulzar2004-wq/taskforge-project-management.git
cd taskforge-project-management
composer install
cp .env.example .env
php artisan key:generate
# configure your database in .env
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

All endpoints are prefixed with `/api/v1`.

| Group | Example Endpoints |
|---|---|
| Auth | `POST /login`, `POST /logout`, `GET /me` |
| Admin | `/admin/users`, `/admin/projects`, `/admin/projects/{id}/members` |
| Manager | `/manager/projects`, `/manager/tasks`, `/manager/reports` |
| Member | `/member/tasks`, `/member/tasks/{id}/status` |
| Shared | `/tasks/{id}/comments`, `/notifications`, `/calendar/events`, `/profile` |

Access to each group is enforced via role middleware (`role:admin`, `role:project_manager`, `role:team_member`).

---

## Author

Built by Abrar Gulzar as a full-stack internship project demonstrating system architecture, authentication, role-based access control, and real-world SaaS application design.
