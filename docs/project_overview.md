# Process Change Database Application

## 1. Project Objective
Build an **internal** web application for **tracking process changes** in a manufacturing environment. The goal is to allow Engineers to propose changes, Supervisors to review and approve them, and Admins to manage system settings. This application will be locally hosted on the corporate network to ensure privacy and security.

---

## 2. Tech Stack
- **Next.js** (React + Node.js runtime)
- **Authentication**: Clerk (handles sign-up/sign-in flows, we store roles in a local DB)
- **Database**: SQLite (local `.db` file on a shared network drive)
- **File Storage**: Local `/uploads` folder on the same network drive (for attachments)
- **Styling**: Tailwind CSS & shadcn/ui
- **ORM (Optional)**: Prisma (for schema management & type-safe queries)
- **Email Notifications**: Nodemailer (using an internal or SMTP server)
- **Hosting**: Local Node server within the corporate network (no Vercel at this time)

---

## 3. User Roles & Responsibilities
1. **Engineer**  
   - Propose new process changes (Status = `PROPOSED`).  
   - Edit/Update any changes they own.  
   - Submit final changes (change Status from `OPEN` to `SUBMITTED`).  

2. **Supervisor**  
   - Review **all** proposed or submitted changes.  
   - Change status from `PROPOSED` → `OPEN`, or from `SUBMITTED` → `ACCEPTED`/`REJECTED`.  
   - Add comments/feedback in the change record.  

3. **Admin**  
   - Full privileges to view/edit/delete all users and process changes.  
   - Oversee system settings (e.g., form fields, user management).  

**Important Note**: While **all** users can see **all** process changes in the dashboard, only **the owner** (Engineer who created it) or an Admin can actually **edit** a specific change.

---

## 4. Authentication (Clerk)
- Clerk provides sign-in/sign-up and manages user sessions.  
- We store a `clerkUserId` in our local **User** table (SQLite) alongside a `role` field.  
- After Clerk authenticates a user, we look up their local record for role-based access.  
- This removes the need to implement custom password hashing or session logic ourselves.

---

## 5. File Storage
- **Uploads** go to the `/uploads` folder on a shared public drive.  
- Database only stores the **path** to each file.  
- Users with network access can also browse those files directly if needed, but the app will show them in the UI as well.

---

## 6. Process Changes (Data Structure)
Each **ProcessChange** record could have fields like:

- **id**: Integer, auto-incremented (primary key)  
- **status**: Enum string: `PROPOSED | OPEN | SUBMITTED | ACCEPTED | REJECTED`  
- **title**: Text (short, 1–2 lines)  
- **processArea**: Enum string: `METALS | ETCH | PLATING | SAW | GRIND | PHOTO | DIFFUSION | OTHER`  
- **changeOwner**: Foreign key linking to `User`, or store as a string referencing `badgeNumber` or `clerkUserId`  
- **proposalDate**: Date/DateTime (when Engineer first proposed the change)  
- **targetDate**: Date/DateTime (when Engineer aims to finalize or implement)  
- **acceptanceDate**: Date/DateTime (only set if `ACCEPTED`)  
- **ageOfChange**: Integer (days since proposal; optionally recalculated if needed)  
- **reason**: Text (why the change is needed)  
- **changeOverview**: Rich text or multiline text describing the change details  
- **generalComments**: Text, primarily used by Supervisor (and Admin) for feedback  
- **attachments**: String or JSON for file paths, e.g. `["/uploads/doc123.pdf"]`  
- **specUpdated**: Boolean (did we update the relevant spec doc?)

---

## 7. UI & Features

### 7.1 Dashboard
- **Visibility**: All users (Engineer, Supervisor, Admin) see **every** process change.  
- **Editing**: Only the Engineer who created a change (or Admin) can edit it.  
- **Filtering**: Optionally filter by status, process area, etc.

### 7.2 Change Detail Page
- **Engineer**: Can modify their own changes (update fields, attach files) until submission.  
- **Supervisor**: Can update status from `PROPOSED` → `OPEN`, add comments, and ultimately `ACCEPT` or `REJECT`.  
- **Admin**: Full edit and override privileges.

### 7.3 Status Workflow
1. **Engineer** creates new change → **Status: `PROPOSED`**.  
2. **Supervisor** reviews details and if valid, marks **Status: `OPEN`**.  
3. **Engineer** does final refinements, then sets **Status: `SUBMITTED`**.  
4. **Supervisor** decides → **Status: `ACCEPTED`** or **`REJECTED`**.  

### 7.4 Notifications
- **Email** to Supervisor when a change is first `PROPOSED` or `SUBMITTED`.  
- **Email** to Engineer when a change is `ACCEPTED` or `REJECTED`.  

---

## 8. Recommended File Structure
PROCESS-CHANGE-DB
├─ node_modules/
├─ uploads/               # Local storage for file attachments
├─ public/                # Static assets
├─ src/
│  ├─ app/                # Next.js (App Router) pages, layouts
│  │   ├─ layout.tsx
│  │   └─ page.tsx
│  ├─ components/         # Reusable UI components
│  ├─ prisma/
│  │   ├─ schema.prisma   # Optional: Prisma models & migrations
│  │   └─ client.ts       # Prisma client
│  ├─ lib/
│  │   ├─ auth.ts         # Clerk & local DB linking
│  │   ├─ email.ts        # Nodemailer setup
│  │   └─ ...
│  └─ ...
├─ data/                  # (Optional) If you store the .db file here
├─ .env                   # Clerk keys, DB paths, SMTP creds
├─ package.json
├─ tsconfig.json
└─ next.config.js

---

## 9. Hosting & Deployment
- **Local Hosting**:  
  - For now, run `npm run build && npm run start` on an internal server with Node.js installed.  
  - This server can directly read/write the local SQLite file and `/uploads` folder.  
- **Future Possibilities**:  
  - You may later explore hosting within the corporate environment or a Docker container.  
  - Since the app is *not* externally accessible, no need for Vercel or other public cloud hosting (unless a future requirement arises).

---

## 10. Summary
This application will:
1. **Streamline** the proposal, review, and approval of process changes.  
2. **Enforce** simple roles: Engineer, Supervisor, Admin, with distinct privileges.  
3. **Store** data in a local SQLite database and file attachments on a shared drive.  
4. **Provide** transparent visibility to all changes in a single dashboard, while restricting edit access to the original owner or Admin.  
5. **Secure** logins via Clerk, removing the need for custom password logic.  
6. **Notify** relevant stakeholders (Supervisors or Engineers) via email during key status changes.

The above plan ensures a **secure, private**, and **user-friendly** environment for manufacturing process updates, aligning with your corporate network constraints and minimal hosting overhead.
