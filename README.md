# Video Game Rental Platform
 <img width="1618" height="562" alt="image" src="https://github.com/user-attachments/assets/f7f88263-3377-4cc0-aad4-f9de1f22f179" />


A digital game rental platform where users can rent games for $5-10/week with temporary access keys.

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Auth**: Supabase Auth

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd video-game-rental
```

### 2. Install Dependencies
```bash
cd client
npm install
```

### 3. Environment Variables

Create a `.env` file in the `/client` directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Ask the team lead for the actual values!**

### 4. Run Development Server
```bash
npm run dev
```
.

Visit `http://localhost:5173`

## 📁 Project Structure
```
client/
├── src/
│   ├── assets/           # Reusable components
│   ├── components/       # Reusable components
│   ├── context/          # React Context (User Authentication sign in logic)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client
│   ├── pages/            # Page components
│   ├── services/         # API calls to Supabase
│   ├── types/            # TypeScript types
```

## 🗄️ Database Schema

### Tables
- `games` - Game library
- `rentals` - User rentals
- `reviews` - Game reviews
- `waitlist` - Waitlist for unavailable games
- `transactions` - Payment history

### Available Services

**Game Service** (`src/services/gameService.ts`):
```typescript
import { getAllGames, getGameById, searchGames } from '../services/gameService';
```

**Auth Context** (`src/context/AuthContext.tsx`):
```typescript
import { useAuth } from '../context/AuthContext';
const { user, signIn, signOut, signUp } = useAuth();
```

## 🎨 Component Examples

### Using the Navbar
```typescript
import Navbar from '../components/common/Navbar';

function MyPage() {
  return (
    <>
      <Navbar />
      <div className="pt-32 px-6">
        {/* Your content */}
      </div>
    </>
  );
}
```

### Fetching Games
```typescript
import { useEffect, useState } from 'react';
import { getAllGames, Game } from '../services/gameService';

function BrowseGames() {
  const [games, setGames] = useState<Game[]>([]);
  
  useEffect(() => {
    const fetchGames = async () => {
      const data = await getAllGames();
      setGames(data);
    };
    fetchGames();
  }, []);
  
  return <div>{/* Render games */}</div>;
}
```

### Using Auth
```typescript
import { useAuth } from '../context/AuthContext';

function ProtectedPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome {user.email}</div>;
}
```

## 📝 Git Workflow

### Before You Start Working
```bash
git pull origin main
git checkout -b feature/your-feature-name
```

### When You're Done
```bash
git add .
git commit -m "Add: description of what you built"
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub!

## 🎯 Available Features to Build

See `TASKS.md` for the list of features that need to be built.

## 🐛 Common Issues

### "Missing Supabase environment variables"
- Make sure you have `.env` file in `/client` directory
- Make sure variables start with `VITE_`
- Restart dev server after adding `.env`

### "useAuth must be used within AuthProvider"
- Check that `AuthProvider` wraps `<App />` in `main.tsx`

### Authentication not working
- Check Supabase dashboard is online
- Verify API keys are correct
- Check browser console for errors

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com)

## 👥 Team

- **Faizaan Delvi** - Product Owner
- **Hunter Shierman** - Scrum Master
- **Aashir Shamim** - Developer
- **Hussain Ismailzada** - Developer
- **Faras Khan** - Developer

## 📞 Need Help?


Contact Hunter (Scrum Master) on Discord/Instagram

