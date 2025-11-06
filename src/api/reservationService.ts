import axios from 'axios';
import type { Reservation, Service } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Get all reservations for a user
export const getUserReservations = async (userId: number): Promise<Reservation[]> => {
  try {
    const response = await apiClient.get(`/reservations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    throw error;
  }
};

// Get a single reservation
export const getReservation = async (userId: number, reservationId: number): Promise<Reservation> => {
  try {
    const response = await apiClient.get(`/reservations/${userId}/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reservation:', error);
    throw error;
  }
};

// Create a new reservation
export const createReservation = async (reservationData: any): Promise<Reservation> => {
  try {
    const response = await apiClient.post('/reservations', reservationData);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

// Get all services for a store
export const getServicesByStore = async (storeId: number): Promise<Service[]> => {
  try {
    const response = await apiClient.get(`/services/store/${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services for store:', error);
    throw error;
  }
};

// Get all services
export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await apiClient.get('/services');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Cancel a reservation
export const cancelReservation = async (reservationId: number): Promise<Reservation> => {
  try {
    const response = await apiClient.put(`/reservations/${reservationId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

// Get all stores
export const getStores = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/stores');
    return response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

// Get a single store
export const getStore = async (storeId: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching store:', error);
    throw error;
  }
};