# PCC Cricket Tournament Deployment Guide

This project is configured for easy deployment on Vercel.

## One-Click Deploy on Vercel
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to [Vercel](https://vercel.com/new) and import your repository.
3. In the deployment settings, configure the following Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (from your Supabase project)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from your Supabase project)
   - `SUPABASE_SERVICE_ROLE_KEY` (from your Supabase project)
   - `NEXT_PUBLIC_APP_URL` (e.g., `https://pcc-cricket.vercel.app`)
4. Click **Deploy**.

## Updating Production Data
Since the admin panel is live in production, any scoring or matches added via the admin panel will instantly update the public site thanks to Supabase Realtime!

## Troubleshooting
- **Admin routes redirecting**: Ensure that you have set the `SUPABASE_SERVICE_ROLE_KEY` in your environment variables.
- **Data not showing**: Make sure you ran the `001_initial_schema.sql` migration and added RLS policies correctly.
