# Process Change Database

An internal web application for tracking process changes in a manufacturing environment. This application allows Engineers to propose changes, Supervisors to review and approve them, and Admins to manage system settings.

## Features

- **Role-based Access Control**: Different permissions for Engineers, Supervisors, and Admins
- **Change Tracking**: Complete workflow from proposal to acceptance/rejection
- **Local Storage**: SQLite database and local file uploads
- **Email Notifications**: Automated emails at key workflow steps

## Tech Stack

- **Next.js** (React + Node.js runtime)
- **Authentication**: Clerk
- **Database**: SQLite (local `.db` file)
- **File Storage**: Local `/uploads` folder
- **Styling**: Tailwind CSS
- **Email Notifications**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd process-change-db
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file with the following variables:
   ```
   # Clerk (Authentication)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Email (Nodemailer)
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASSWORD=your_smtp_password
   SMTP_SECURE=true_or_false
   EMAIL_FROM=process-change@company.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Workflow

1. **Engineer** creates new change → **Status: `PROPOSED`**
2. **Supervisor** reviews details and if valid, marks **Status: `OPEN`**
3. **Engineer** does final refinements, then sets **Status: `SUBMITTED`**
4. **Supervisor** decides → **Status: `ACCEPTED`** or **`REJECTED`**

## Deployment

For local deployment within your corporate network:

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   yarn start
   ```

## Project Structure

- `/src/app` - Next.js pages and API routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and database operations
- `/data` - SQLite database file (gitignored)
- `/uploads` - File storage for attachments
- `/docs` - Project documentation

## License

This project is proprietary and intended for internal use only.

## Documentation

For more detailed information, see:
- [Project Overview](./docs/project_overview.md)
- [Development Roadmap](./docs/development_roadmap.md)
