# Database Documentation 🗄️

## Overview

This project uses **Supabase** (PostgreSQL) as the backend database. Supabase provides:
- PostgreSQL database hosting
- Auto-generated REST API
- Built-in authentication
- Row Level Security (RLS)
- Real-time subscriptions

**Supabase Project URL:** `https://your-project-id.supabase.co`

---

## Table of Contents

1. [Database Schema](#database-schema)
2. [How Connections Work](#how-connections-work)
3. [Authentication Flow](#authentication-flow)
4. [Querying the Database](#querying-the-database)
5. [Security (RLS Policies)](#security-rls-policies)
6. [Common Queries](#common-queries)
7. [Troubleshooting](#troubleshooting)

---

## Database Schema

### Entity Relationship Diagram
```
┌─────────────┐
│ auth.users  │ (Managed by Supabase Auth)
│─────────────│
│ id (PK)     │
│ email       │
│ created_at  │
└──────┬──────┘
       │
       │ (user_id FK)
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│  rentals    │                          │  reviews    │
│─────────────│                          │─────────────│
│ id (PK)     │                          │ id (PK)     │
│ user_id (FK)│─────┐                    │ user_id (FK)│
│ game_id (FK)│     │                    │ game_id (FK)│
│ access_key  │     │                    │ rating      │
│ start_date  │     │                    │ comment     │
│ end_date    │     │                    │ created_at  │
│ status      │     │                    └─────────────┘
│ price       │     │
│ created_at  │     │
└─────────────┘     │
       │            │
       │            │
       ▼            ▼
┌─────────────┐  ┌──────────────┐
│   games     │  │  waitlist    │
│─────────────│  │──────────────│
│ id (PK)     │  │ id (PK)      │
│ title       │  │ user_id (FK) │
│ description │  │ game_id (FK) │
│ genre       │  │ position     │
│ platform    │  │ notified     │
│ price       │  │ created_at   │
│ image_url   │  └──────────────┘
│ available   │
│ total_copies│
│ available_  │
│   copies    │
│ popularity_ │
│   score     │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ (rental_id FK)
       ▼
┌──────────────┐
│ transactions │
│──────────────│
│ id (PK)      │
│ user_id (FK) │
│ rental_id(FK)│
│ amount       │
│ transaction_ │
│   type       │
│ created_at   │
└──────────────┘
```

---

## Tables

### 1. `auth.users` (Managed by Supabase)

**Purpose:** Stores user accounts and authentication data

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `email` | TEXT | User's email address |
| `encrypted_password` | TEXT | Hashed password (managed by Supabase) |
| `created_at` | TIMESTAMP | Account creation time |

**Managed by Supabase Auth** - You don't need to insert into this table directly.

---

### 2. `games`

**Purpose:** Stores the game library

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `title` | TEXT | Game title |
| `description` | TEXT | Game description |
| `genre` | TEXT | Game genre (RPG, Action, etc.) |
| `platform` | TEXT | Platform (PC, PlayStation 5, etc.) |
| `price` | DECIMAL(10,2) | Rental price per week |
| `image_url` | TEXT | Cover image URL |
| `available` | BOOLEAN | Is game currently available? |
| `total_copies` | INTEGER | Total copies owned |
| `available_copies` | INTEGER | Copies currently available |
| `popularity_score` | INTEGER | Popularity metric (for sorting) |
| `created_at` | TIMESTAMP | When game was added |
| `updated_at` | TIMESTAMP | Last update time |

**Constraints:**
- `available_copies` ≤ `total_copies`
- `available_copies` ≥ 0

**Indexes:**
- `idx_games_genre` on `genre`
- `idx_games_platform` on `platform`
- `idx_games_available` on `available`

---

### 3. `rentals`

**Purpose:** Tracks user rentals

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users.id` |
| `game_id` | UUID | Foreign key → `games.id` |
| `access_key` | TEXT | Unique rental access code |
| `start_date` | TIMESTAMP | Rental start time |
| `end_date` | TIMESTAMP | Rental expiration time |
| `status` | TEXT | 'active', 'expired', or 'extended' |
| `price` | DECIMAL(10,2) | Price paid for this rental |
| `created_at` | TIMESTAMP | When rental was created |

**Constraints:**
- `access_key` must be unique
- One active rental per user per game (unique index)
- `status` must be one of: 'active', 'expired', 'extended'

**Indexes:**
- `idx_rentals_user` on `user_id`
- `idx_rentals_game` on `game_id`
- `idx_rentals_status` on `status`
- `idx_rentals_end_date` on `end_date`

---

### 4. `reviews`

**Purpose:** User reviews for games

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users.id` |
| `game_id` | UUID | Foreign key → `games.id` |
| `rating` | INTEGER | Rating (1-5) |
| `comment` | TEXT | Review text (optional) |
| `created_at` | TIMESTAMP | When review was created |
| `updated_at` | TIMESTAMP | Last update time |

**Constraints:**
- `rating` must be between 1 and 5
- One review per user per game (unique constraint)

**Indexes:**
- `idx_reviews_game` on `game_id`
- `idx_reviews_user` on `user_id`

---

### 5. `waitlist`

**Purpose:** Users waiting for unavailable games

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users.id` |
| `game_id` | UUID | Foreign key → `games.id` |
| `position` | INTEGER | Position in waitlist |
| `notified` | BOOLEAN | Has user been notified? |
| `created_at` | TIMESTAMP | When joined waitlist |

**Constraints:**
- One waitlist entry per user per game (unique constraint)

**Indexes:**
- `idx_waitlist_game` on `game_id`
- `idx_waitlist_user` on `user_id`
- `idx_waitlist_notified` on `notified`
- `idx_waitlist_position` on `(game_id, position)`

---

### 6. `transactions`

**Purpose:** Payment/rental transaction history (for admin analytics)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users.id` |
| `rental_id` | UUID | Foreign key → `rentals.id` (nullable) |
| `amount` | DECIMAL(10,2) | Transaction amount |
| `transaction_type` | TEXT | 'rental' or 'extension' |
| `created_at` | TIMESTAMP | Transaction timestamp |

**Constraints:**
- `transaction_type` must be 'rental' or 'extension'

**Indexes:**
- `idx_transactions_user` on `user_id`
- `idx_transactions_rental` on `rental_id`
- `idx_transactions_date` on `created_at`
- `idx_transactions_type` on `transaction_type`

---

## How Connections Work

### Architecture Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Browser)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Components (LoginPage, BrowseGames, etc.)             │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│                          │ import { supabase }               │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Supabase Client (src/lib/supabaseClient.ts)          │ │
│  │  • Initialized with URL + API Key                      │ │
│  │  • Handles authentication                              │ │
│  │  • Makes database queries                              │ │
│  └───────────────────────┬────────────────────────────────┘ │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS Requests
                           │ (with JWT token)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Cloud (Backend)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Gateway                                           │ │
│  │  • Validates API key                                   │ │
│  │  • Checks JWT token                                    │ │
│  │  • Routes requests                                     │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Row Level Security (RLS) Engine                       │ │
│  │  • Applies security policies                           │ │
│  │  • Filters data based on user                          │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                   │ │
│  │  • Executes SQL queries                                │ │
│  │  • Returns filtered results                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Connection Setup

### 1. Environment Variables

Located in `/client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**What these do:**
- **URL**: Points to your Supabase project
- **Anon Key**: Public API key (safe to use in browser with RLS enabled)

---

### 2. Supabase Client Initialization

**File:** `src/lib/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**What this does:**
1. Imports Supabase JavaScript client library
2. Reads environment variables
3. Creates a client instance with your credentials
4. Exports it for use throughout the app

---

### 3. Making Database Queries

**Example:** `src/services/gameService.ts`
```typescript
import { supabase } from '../lib/supabaseClient';

export const getAllGames = async () => {
  const { data, error } = await supabase
    .from('games')              // ← Table name
    .select('*')                // ← Columns to fetch
    .order('title', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};
```

**What happens:**
1. `supabase.from('games')` → Targets the `games` table
2. `.select('*')` → Fetch all columns
3. `.order(...)` → Sort results
4. Request is sent to Supabase API via HTTPS
5. Supabase checks RLS policies
6. Returns filtered data

---

## Authentication Flow

### How Login Works
```
1. User enters email/password in LoginPage
   ↓
2. Component calls: await signIn(email, password)
   ↓
3. AuthContext executes:
   await supabase.auth.signInWithPassword({ email, password })
   ↓
4. Supabase validates credentials
   ↓
5. If valid, Supabase returns:
   - User object { id, email, ... }
   - Session object with JWT token
   ↓
6. AuthContext stores user/session in React state
   ↓
7. JWT token is automatically attached to ALL future requests
   ↓
8. RLS policies use JWT to identify current user
```

### Session Persistence

**How users stay logged in:**
```typescript
// On app load, AuthContext checks for existing session:
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });
}, []);
```

**Session stored in:**
- Browser's localStorage (key: `sb-<project-id>-auth-token`)
- Automatically sent with every request
- Valid for 7 days by default

---

## Security (RLS Policies)

### What is Row Level Security (RLS)?

RLS ensures users can only access data they're allowed to see. Even with the API key, users can't bypass RLS.

### Example: Rentals Table

**Policy:** "Users can only view their own rentals"
```sql
CREATE POLICY "Users can view their own rentals" 
  ON rentals 
  FOR SELECT 
  USING (auth.uid() = user_id);
```

**How it works:**
1. User makes request: `supabase.from('rentals').select('*')`
2. Supabase extracts user ID from JWT token
3. SQL becomes: `SELECT * FROM rentals WHERE user_id = <current_user_id>`
4. User only sees their rentals, not others'

---

### All RLS Policies

#### Games Table
- ✅ **Anyone** can view games (even not logged in)
- ✅ **Authenticated users** can insert/update/delete (admin role later)

#### Rentals Table
- ✅ **Users** can only view their own rentals
- ✅ **Users** can only create rentals for themselves
- ✅ **Users** can only update their own rentals

#### Reviews Table
- ✅ **Anyone** can view all reviews
- ✅ **Users** can only create/update/delete their own reviews

#### Waitlist Table
- ✅ **Users** can only view their own waitlist entries
- ✅ **Users** can only add/remove themselves

#### Transactions Table
- ✅ **Users** can only view their own transactions
- ✅ **System** can create transactions

---

## Querying the Database

### Basic CRUD Operations

#### **READ (Select)**
```typescript
// Get all games
const { data, error } = await supabase
  .from('games')
  .select('*');

// Get single game by ID
const { data, error } = await supabase
  .from('games')
  .select('*')
  .eq('id', gameId)
  .single();

// Get with filter
const { data, error } = await supabase
  .from('games')
  .select('*')
  .eq('genre', 'RPG')
  .gt('available_copies', 0);

// Search (case-insensitive)
const { data, error } = await supabase
  .from('games')
  .select('*')
  .ilike('title', '%elden%');
```

---

#### **CREATE (Insert)**
```typescript
// Insert single record
const { data, error } = await supabase
  .from('rentals')
  .insert({
    user_id: userId,
    game_id: gameId,
    access_key: 'ABC-123-XYZ',
    end_date: '2026-02-23T00:00:00Z',
    price: 8.99,
    status: 'active'
  })
  .select()
  .single();

// Insert multiple records
const { data, error } = await supabase
  .from('games')
  .insert([
    { title: 'Game 1', genre: 'RPG', ... },
    { title: 'Game 2', genre: 'Action', ... }
  ]);
```

---

#### **UPDATE**
```typescript
// Update by ID
const { data, error } = await supabase
  .from('games')
  .update({ available_copies: 4 })
  .eq('id', gameId)
  .select()
  .single();

// Update multiple records
const { data, error } = await supabase
  .from('rentals')
  .update({ status: 'expired' })
  .lt('end_date', new Date().toISOString());
```

---

#### **DELETE**
```typescript
// Delete by ID
const { error } = await supabase
  .from('waitlist')
  .delete()
  .eq('id', waitlistId);

// Delete with condition
const { error } = await supabase
  .from('reviews')
  .delete()
  .eq('user_id', userId)
  .eq('game_id', gameId);
```

---

### Advanced Queries

#### **Joins (Relationships)**
```typescript
// Get rentals with game details
const { data, error } = await supabase
  .from('rentals')
  .select(`
    *,
    games (
      title,
      image_url,
      genre,
      platform
    )
  `)
  .eq('user_id', userId);

// Returns:
// [
//   {
//     id: '...',
//     user_id: '...',
//     access_key: '...',
//     games: {
//       title: 'Elden Ring',
//       image_url: '...',
//       genre: 'RPG',
//       platform: 'PC'
//     }
//   }
// ]
```

---

#### **Filtering**
```typescript
// Operators
.eq('column', value)         // Equal to
.neq('column', value)        // Not equal to
.gt('column', value)         // Greater than
.gte('column', value)        // Greater than or equal
.lt('column', value)         // Less than
.lte('column', value)        // Less than or equal
.like('column', pattern)     // Case-sensitive pattern match
.ilike('column', pattern)    // Case-insensitive pattern match
.in('column', [values])      // In array
.is('column', null)          // Is null
```

**Example:**
```typescript
const { data } = await supabase
  .from('games')
  .select('*')
  .in('platform', ['PC', 'PlayStation 5'])
  .gte('price', 5)
  .lte('price', 10)
  .order('title', { ascending: true });
```

---

#### **Pagination**
```typescript
const { data, error } = await supabase
  .from('games')
  .select('*')
  .range(0, 9);  // First 10 records (0-9)

// Page 2 (records 10-19)
.range(10, 19)

// Page 3 (records 20-29)
.range(20, 29)
```

---

#### **Counting**
```typescript
const { count, error } = await supabase
  .from('games')
  .select('*', { count: 'exact', head: true })
  .eq('genre', 'RPG');

console.log(`Found ${count} RPG games`);
```

---

## Common Queries

### Get User's Active Rentals
```typescript
const { data: activeRentals } = await supabase
  .from('rentals')
  .select(`
    *,
    games (title, image_url, genre, platform)
  `)
  .eq('user_id', userId)
  .eq('status', 'active')
  .order('end_date', { ascending: true });
```

---

### Get Available Games
```typescript
const { data: availableGames } = await supabase
  .from('games')
  .select('*')
  .gt('available_copies', 0)
  .order('title', { ascending: true });
```

---

### Get Game with Reviews
```typescript
const { data: game } = await supabase
  .from('games')
  .select(`
    *,
    reviews (
      id,
      rating,
      comment,
      created_at,
      user_id
    )
  `)
  .eq('id', gameId)
  .single();
```

---

### Check if User Can Review Game
```typescript
// User must have rented the game to review it
const { data: rental } = await supabase
  .from('rentals')
  .select('id')
  .eq('user_id', userId)
  .eq('game_id', gameId)
  .eq('status', 'expired')  // Only after rental expires
  .single();

const canReview = !!rental;
```

---

### Get Waitlist Position
```typescript
const { data: waitlist } = await supabase
  .from('waitlist')
  .select('position')
  .eq('game_id', gameId)
  .order('position', { ascending: true });

// User's position
const { data: myEntry } = await supabase
  .from('waitlist')
  .select('position')
  .eq('game_id', gameId)
  .eq('user_id', userId)
  .single();
```

---

## Troubleshooting

### "Missing Supabase environment variables"

**Cause:** `.env` file doesn't exist or variables not set

**Fix:**
1. Create `/client/.env` file
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart dev server: `npm run dev`

---

### "Row level security policy violation"

**Cause:** Trying to access data you don't have permission for

**Example:**
```typescript
// Trying to view another user's rentals
const { data, error } = await supabase
  .from('rentals')
  .select('*')
  .eq('user_id', 'someone-else-id');  // ❌ RLS blocks this
```

**Fix:**
- Only query data you own (use `auth.uid()`)
- Check RLS policies in Supabase dashboard

---

### "null value in column violates not-null constraint"

**Cause:** Missing required field in insert

**Example:**
```typescript
// Missing required fields
const { error } = await supabase
  .from('rentals')
  .insert({
    user_id: userId,
    // ❌ Missing: game_id, access_key, end_date, price
  });
```

**Fix:** Include all required (NOT NULL) columns

---

### "Foreign key violation"

**Cause:** Referencing ID that doesn't exist

**Example:**
```typescript
// Game ID doesn't exist in games table
const { error } = await supabase
  .from('rentals')
  .insert({
    game_id: 'fake-id-123',  // ❌ Not in games table
    ...
  });
```

**Fix:** Verify foreign key IDs exist before inserting

---

### "duplicate key value violates unique constraint"

**Cause:** Trying to insert duplicate unique value

**Example:**
```typescript
// User already has a review for this game
const { error } = await supabase
  .from('reviews')
  .insert({
    user_id: userId,
    game_id: gameId,  // ❌ Already reviewed
    rating: 5
  });
```

**Fix:**
- Use `.upsert()` instead of `.insert()`
- Check if record exists first
- Update existing record

---

## Best Practices

### ✅ DO

- Always handle errors from Supabase queries
- Use TypeScript types for database responses
- Validate data before inserting
- Use transactions for related operations
- Keep queries in service files, not components
- Use RLS for security, not client-side checks

### ❌ DON'T

- Don't put `.env` in Git (use `.env.example` instead)
- Don't trust client-side validation alone
- Don't expose service role key in frontend
- Don't fetch unnecessary data (use `.select()` wisely)
- Don't make queries in loops (use `.in()` instead)

---

## Useful Links

- **Supabase Dashboard:** `https://supabase.com/dashboard/project/<your-project-id>`
- **Table Editor:** `https://supabase.com/dashboard/project/<your-project-id>/editor`
- **SQL Editor:** `https://supabase.com/dashboard/project/<your-project-id>/sql`
- **Auth Users:** `https://supabase.com/dashboard/project/<your-project-id>/auth/users`
- **API Docs:** `https://supabase.com/dashboard/project/<your-project-id>/api`

---

## Getting Help

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - View real-time query logs and errors

2. **Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Ask Team:**
   - Post in Discord/Slack
   - Include error message and code snippet

4. **Supabase Docs:**
   - https://supabase.com/docs
   - https://supabase.com/docs/reference/javascript

---