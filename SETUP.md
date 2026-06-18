# PCC Cricket Tournament Setup Guide

Welcome to the PCC Cricket Tournament platform. Follow these steps to set up your local development environment.

## Prerequisites
- Node.js v18 or higher
- npm or yarn or pnpm
- A free Supabase account (https://supabase.com)

## Step 1: Clone and Install
```bash
# Install dependencies
npm install
```

## Step 2: Supabase Setup
1. Log in to Supabase and create a new project.
2. Go to **Project Settings -> API** and copy:
   - Project URL
   - anon public key
   - service_role secret key
3. Copy the `.env.local.example` file to `.env.local` and paste your keys:
   ```bash
   cp .env.local.example .env.local
   ```
4. Update the `.env.local` file with your keys.

## Step 3: Database Setup
1. In your Supabase dashboard, go to the **SQL Editor**.
2. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Run the query to create all tables and RLS policies.
4. Create another new query and paste the contents of `supabase/seed.sql`.
5. Run the query to insert the sample tournament data.

## Step 4: Admin Account Setup
To log in to the admin panel, you need an authenticated user.
1. Go to **Authentication -> Users** in your Supabase dashboard.
2. Click **Add user** -> **Create new user**.
3. Enter your preferred admin email (e.g., `admin@pcc.com`) and a strong password.
4. Uncheck "Auto Confirm User?" if you want to verify via email, OR manually confirm them in the UI after creation.
5. This email/password will now work on the `/admin/login` page.

## Step 5: Run the App Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Accessing the Admin Panel
Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and log in with the user you created in Step 4.
