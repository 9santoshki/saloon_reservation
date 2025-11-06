// Types for Saloon/SPA Reservation App

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'store_owner';
  store_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  description: string;
  opening_hours: OpeningHours;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  [key: string]: {
    open: string; // HH:MM format
    close: string; // HH:MM format
  };
}

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  store_id: number;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  store_id: number;
  service_id: number;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM format
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  user_id: number;
  store_id: number;
  service_id: number;
  reservation_date: string;
  reservation_time: string;
  duration: number;
  total_amount: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AppUser;
}