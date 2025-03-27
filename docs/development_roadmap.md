# Development Roadmap

This document references [project_overview.md](./project_overview.md) to ensure the AI and developers have maximum context regarding the tech stack, roles, data structures, and workflow.

## 1. Objectives & Constraints

1. **Objective**: Build an internal web application for tracking manufacturing process changes.
2. **Constraints**:  
   - Must be built in **Next.js** + **Node.js**.  
   - Use **SQLite** stored on a shared/local drive.  
   - Use **local hosting** (no external cloud hosting for now).  
   - Clerk for authentication.  
   - Local file uploads to `/uploads`.  
   - Role-based access (Engineer, Supervisor, Admin).

Refer to **Section 1 & 2** of [project_overview.md](./project_overview.md) for more details on the project objective and tech stack.

---

## 2. Folder Structure & Project Setup

1. **Base Project Creation**  
   - Already done via Next.js CLI (`npx create-next-app`).  
   - Folder structure can differ slightly from the example in [project_overview.md](./project_overview.md), but should include:
     - `app/` (for Next.js routes and layouts)
     - `docs/` (for project documentation like this file)
     - `public/` (for static assets)
     - `uploads/` (for file attachments)
     - `data/` (for SQLite `.db` file)
     - `.env` (for secrets and environment variables)
2. **.gitignore**  
   - Ensure `data/*.db` or similar patterns are ignored so your DB file is never committed.
3. **Dependencies**  
   - `npm install clerk nodemailer sqlite3` (or `better-sqlite3`, if preferred).
   - Optionally install `tailwindcss` and `shadcn/ui` for styling.

See **Section 8** of [project_overview.md](./project_overview.md) for a recommended file structure.

---

## 3. Authentication & User Management

1. **Integrate Clerk**  
   - Configure your Clerk project to handle sign-up/sign-in.
   - Store user roles in a local `User` table (see `User` schema details in [project_overview.md](./project_overview.md)).
2. **Local DB for Roles**  
   - Create a table (e.g., `Users`) with columns:
     - `id` (primary key)
     - `clerkUserId`
     - `role` (ENGINEER, SUPERVISOR, ADMIN)
     - any other relevant fields (like `badgeNumber`, etc.)
3. **Middleware**  
   - Write a simple Next.js middleware or server-side logic that checks Clerk’s session and fetches the corresponding local user’s role.

Refer to **Section 4** in [project_overview.md](./project_overview.md) for details on how Clerk integrates with the local DB.

---

## 4. Database Setup (Skipping Prisma)

1. **SQLite File**  
   - Create or open `./data/app_database.db`.
   - Ensure it’s `.gitignore`-d.
2. **Schema**  
   - Manually create tables for `Users`, `ProcessChanges`, etc.
     ```sql
     CREATE TABLE IF NOT EXISTS Users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       clerkUserId TEXT NOT NULL,
       role TEXT NOT NULL
       /* ... add columns as needed */
     );

     CREATE TABLE IF NOT EXISTS ProcessChanges (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       status TEXT NOT NULL,
       title TEXT NOT NULL,
       processArea TEXT,
       changeOwner INTEGER,
       proposalDate TEXT,
       targetDate TEXT,
       acceptanceDate TEXT,
       ageOfChange INTEGER,
       reason TEXT,
       changeOverview TEXT,
       generalComments TEXT,
       attachments TEXT,
       specUpdated BOOLEAN
       /* ... etc. */
     );
     ```
   - Optionally create more tables for logs, notifications, etc.

See **Section 6** of [project_overview.md](./project_overview.md) for the recommended fields.

---

## 5. Core Features (CRUD & Status Workflow)

1. **ProcessChange CRUD**  
   - **Create**: An Engineer proposes a new change (status = `PROPOSED`).  
   - **Read**: All users can see all changes in a dashboard.  
   - **Update**: Only the owner (Engineer) or Admin can edit a record.  
   - **Delete**: Typically only Admin or the record owner (if still in `PROPOSED`).
2. **Status Workflow**  
   - `PROPOSED` → `OPEN` → `SUBMITTED` → `ACCEPTED` or `REJECTED`.
   - Supervisor transitions `PROPOSED` → `OPEN` or `SUBMITTED` → `ACCEPTED/REJECTED`.
   - Engineer transitions `OPEN` → `SUBMITTED`.
3. **UI Pages**  
   - **Dashboard** (lists all process changes, filterable by status or process area).  
   - **Change Detail** (allows editing for owners/Admin and status updates for Supervisors).

Refer to **Section 7** in [project_overview.md](./project_overview.md) for UI details.

---

## 6. File Uploads

1. **Uploads Folder**  
   - Place files in `/uploads` with unique filenames or subfolders for organization.
2. **Storing Paths**  
   - Store the relative path (e.g., `/uploads/<fileName>`) in the `attachments` column.
3. **Access Control**  
   - All users can view attachments in the UI if they have permission to see the record.

See **Section 5** of [project_overview.md](./project_overview.md) for more on file storage.

---

## 7. Notifications (Nodemailer)

1. **Nodemailer Setup**  
   - Install and configure transporter in `src/lib/email.ts`.
   - Store SMTP credentials in `.env`.
2. **When to Send Emails**  
   - Engineer → Supervisor: On new `PROPOSED` changes, or when an `OPEN` change is `SUBMITTED`.  
   - Supervisor → Engineer: On acceptance or rejection of a change.

See **Section 7.4** in [project_overview.md](./project_overview.md) for when to trigger emails.

---

## 8. Testing & Deployment

1. **Local Testing**  
   - Use `npm run dev` for local development and testing.  
   - Ensure concurrency is minimal if multiple engineers access the `.db` simultaneously.
2. **Build & Start**  
   - `npm run build && npm run start` on your internal server.  
   - Confirm the `.db` file is accessible from that server.
3. **Future Scalability**  
   - Possibly containerize the app in Docker if needed.  
   - Explore advanced hosting if the local solution becomes insufficient.

See **Section 9** of [project_overview.md](./project_overview.md) for notes on hosting and deployment.

---

## 9. Future Enhancements

1. **Role & Permission Extensions**  
   - More granular roles or departmental grouping.
2. **Audit Logs**  
   - Track changes over time with timestamps and user actions.
3. **Reporting & Analytics**  
   - Summaries of how many changes are in each status, average time to acceptance, etc.

---

## 10. Conclusion

By following this roadmap **in order**, you’ll build a fully functional Process Change Database Application. The app will have:
- **Role-based access** (Engineer, Supervisor, Admin).
- **Local** SQLite storage with file attachments.
- **Clerk** authentication with minimal custom auth logic.
- **Email** notifications at critical workflow steps.

Consult [project_overview.md](./project_overview.md) for any deeper details on the data model, roles, or workflow. 

**Happy Building!**
