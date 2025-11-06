import React, { createContext, useContext, useReducer } from 'react';
import type { User, Store, Reservation } from '../types';

interface BookingState {
  user: User | null;
  selectedStore: Store | null;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedService: string | null;
  reservations: Reservation[];
}

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

const initialState: BookingState = {
  user: null,
  selectedStore: null,
  selectedDate: null,
  selectedTime: null,
  selectedService: null,
  reservations: [],
};

type BookingAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_SELECTED_STORE'; payload: Store }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_SELECTED_TIME'; payload: string }
  | { type: 'SET_SELECTED_SERVICE'; payload: string }
  | { type: 'SET_RESERVATIONS'; payload: Reservation[] }
  | { type: 'ADD_RESERVATION'; payload: Reservation }
  | { type: 'UPDATE_RESERVATION'; payload: Reservation }
  | { type: 'REMOVE_RESERVATION'; payload: number };

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SELECTED_STORE':
      return { ...state, selectedStore: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_SELECTED_TIME':
      return { ...state, selectedTime: action.payload };
    case 'SET_SELECTED_SERVICE':
      return { ...state, selectedService: action.payload };
    case 'SET_RESERVATIONS':
      return { ...state, reservations: action.payload };
    case 'ADD_RESERVATION':
      return { ...state, reservations: [...state.reservations, action.payload] };
    case 'UPDATE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.map(res =>
          res.id === action.payload.id ? action.payload : res
        ),
      };
    case 'REMOVE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.filter(res => res.id !== action.payload),
      };
    default:
      return state;
  }
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};