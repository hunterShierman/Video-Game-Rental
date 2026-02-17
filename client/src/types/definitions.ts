// ============================================
// GAME TYPES
// ============================================
export interface Game {
  id: string;
  title: string;
  description: string | null;
  genre: string;
  platform: string;
  price: number;
  image_url: string | null;
  available: boolean;
  total_copies: number;
  available_copies: number;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

// For creating a new game (without auto-generated fields)
export interface CreateGameInput {
  title: string;
  description?: string;
  genre: string;
  platform: string;
  price: number;
  image_url?: string;
  total_copies?: number;
  available_copies?: number;
}

// For updating a game (all fields optional)
export interface UpdateGameInput {
  title?: string;
  description?: string;
  genre?: string;
  platform?: string;
  price?: number;
  image_url?: string;
  available?: boolean;
  total_copies?: number;
  available_copies?: number;
  popularity_score?: number;
}

// ============================================
// RENTAL TYPES
// ============================================
export interface Rental {
  id: string;
  user_id: string;
  game_id: string;
  access_key: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'extended';
  price: number;
  created_at: string;
}

export interface CreateRentalInput {
  game_id: string;
  access_key: string;
  end_date: string;
  price: number;
}

// Rental joined with game info — used when displaying rental details to the user
export interface RentalWithGame extends Rental {
  games: {
    title: string;
    image_url: string | null;
    platform: string;
  };
}

// ============================================
// REVIEW TYPES
// ============================================
export interface Review {
  id: string;
  user_id: string;
  game_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewInput {
  game_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

// ============================================
// WAITLIST TYPES
// ============================================
export interface Waitlist {
  id: string;
  user_id: string;
  game_id: string;
  position: number | null;
  notified: boolean;
  created_at: string;
}

export interface CreateWaitlistInput {
  game_id: string;
}

// ============================================
// TRANSACTION TYPES
// ============================================
export interface Transaction {
  id: string;
  user_id: string;
  rental_id: string | null;
  amount: number;
  transaction_type: 'rental' | 'extension';
  created_at: string;
}

export interface CreateTransactionInput {
  rental_id?: string;
  amount: number;
  transaction_type: 'rental' | 'extension';
}

// ============================================
// USER TYPES (from Supabase Auth)
// ============================================
export interface User {
  id: string;
  email: string;
  created_at: string;
  // Add more fields as needed from Supabase auth.users
}

// ============================================
// FILTER TYPES
// ============================================
export interface GameFilters {
  genre?: string;
  platform?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  searchTerm?: string;
}

// ============================================
// COMMON TYPES
// ============================================
export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}