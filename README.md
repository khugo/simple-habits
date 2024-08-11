# Simple Habits

This is a simple habit tracker app for my personal use. It provides minimal functionality required by me: a calendar
view of the full year for each habit.

## Development

This is a Supabase app. You need to have a Supabase account and a project set up to run this app. The DB schema
is stored in the `supabase/migrations` directory.

To develop, just run `npm run dev`. This will connect to the production Supabase instance.

You'll need to copy `.env.example` to `.env.local` and fill in the values.

## Production environment

The backend is a Supabase app, and the frontend is a static site hosted on GitHub Pages. The frontend is deployed
automatically when you push to the `master` branch.

## TODO

- [ ] Highlight selected date in calendar
- [ ] Dark mode
- [ ] Support ordering habits