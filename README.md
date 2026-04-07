# GameRent - Retro Video Game Rental Platform

<img width="1618" height="562" alt="image" src="https://github.com/user-attachments/assets/f7f88263-3377-4cc0-aad4-f9de1f22f179" />

A digital retro game rental platform where users can rent classic titles (NES, SNES, N64, PS1, and more) for $3-7/week using temporary access keys. No cartridge hunting required.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RPC)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

## Prerequisites

- Node.js v18+
- npm
- Git

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd video-game-rental
```

### 2. Install dependencies
```bash
cd client
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `client/` directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Ask the team lead for the actual values.

### 4. Start the dev server
```bash
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
client/
└── src/
    ├── components/       # Reusable UI components (Navbar, GameCard, Modal, etc.)
    ├── context/          # React Context - AuthContext (sign in/out/up)
    ├── hooks/            # Custom hooks (useAsyncData)
    ├── lib/              # Supabase client instance
    ├── pages/            # Route-level page components
    ├── services/         # Supabase data access (games, rentals, reviews, waitlist)
    ├── types/            # Shared TypeScript interfaces (Game, Rental, Review, etc.)
    └── utils/            # Auth helpers, date utilities, constants
```

## Routes

| Path | Page | Auth Required |
|------|------|:---:|
| `/` | Home (trending games, how-it-works) | No |
| `/browse-page` | Browse & filter retro library | No |
| `/games/:id` | Game detail + reviews | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/forgot-password` | Forgot password | No |
| `/update-password` | Reset password | No |
| `/my-rentals` | View active rentals + countdowns | No |
| `/rental/:rentalId/extend/:gameId` | Extend a rental | No |
| `/waitlist` | Waitlist for unavailable games | No |
| `/admin-dashboard` | Analytics dashboard | Admin only |
| `/admin-games` | Manage game library (CRUD) | Admin only |

## Features

- **Browse & filter**: search by title, genre, platform, and era (70s/80s/90s)
- **Rental system**: rent for a fixed period, receive a unique access key
- **Rental countdown**: live timer showing time remaining on active rentals
- **Rental extension**: extend eligible rentals before they expire
- **Waitlist**: join a queue when a game has no available copies
- **Game recommendations**: suggested titles based on rental history
- **Reviews**: authenticated users can rate and review games they've rented
- **Admin dashboard**: analytics on revenue, genre popularity, waitlist lengths
- **Admin game management**: add, edit, and delete games from the library

## Database Tables

| Table | Purpose |
|-------|---------|
| `games` | Game library (title, genre, platform, release_year, copies, price) |
| `rentals` | User rentals with access keys, dates, and status |
| `reviews` | Star ratings and comments per game |
| `waitlist` | Queued users per game |
| `transactions` | Payment history for rentals and extensions |

## Common Issues

**"Missing Supabase environment variables"**
- Ensure `.env` exists in `client/`
- Variables must start with `VITE_`
- Restart the dev server after adding `.env`

**"useAuth must be used within AuthProvider"**
- Verify `AuthProvider` wraps `<App />` in `main.tsx`

**Authentication not working**
- Check the Supabase dashboard is active
- Confirm API keys are correct
- Check the browser console for errors

## Git Workflow

```bash
# Before starting work
git pull origin main
git checkout -b feature/your-feature-name

# When done
git add .
git commit -m "Add: description of what you built"
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com)

## Team

| Name | Role |
|------|------|
| Faizaan Delvi | Product Owner |
| Hunter Shierman | Scrum Master |
| Aashir Shamim | Developer |
| Hussain Ismailzada | Developer |
| Faras Khan | Developer |

## Need Help?

Contact Hunter (Scrum Master) on Discord/Instagram.
