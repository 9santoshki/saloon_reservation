import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { mockStores, mockServices } from '../utils/mockData';
import { getUserReservations, cancelReservation } from '../api/reservationService';
import type { Reservation } from '../types';

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch user's reservations from the backend
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // Using mock user ID for now - in a real app, this would come from authentication
        const userId = 1;
        const userReservations = await getUserReservations(userId);
        setReservations(userReservations);
      } catch (error) {
        setMessage('Failed to load reservations. Using mock data.');
        console.error('Error fetching reservations:', error);
        // Fallback to mock data in case of API error
        // You could import mock data here if needed
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancelReservation = async (reservationId: number) => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Call the API to cancel the reservation
      const updatedReservation = await cancelReservation(reservationId);
      
      // Update the local state to reflect the cancellation
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? updatedReservation : res
        )
      );
      
      setMessage('Reservation cancelled successfully');
    } catch (error) {
      setMessage('Failed to cancel reservation. Please try again.');
      console.error('Error cancelling reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  const getStoreName = (storeId: number) => {
    const store = mockStores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  if (loading && reservations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">Loading reservations...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        My Reservations
      </Typography>
      
      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="reservations table">
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => {
              
              return (
                <TableRow
                  key={reservation.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {mockServices.find(service => service.id === reservation.service_id)?.name || 'Service'}
                  </TableCell>
                  <TableCell>
                    {getStoreName(reservation.store_id)}
                  </TableCell>
                  <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
                  <TableCell>{formatTime(reservation.reservation_time)}</TableCell>
                  <TableCell>{reservation.duration} min</TableCell>
                  <TableCell>${reservation.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={reservation.status} 
                      color={
                        reservation.status === 'confirmed' ? 'primary' : 
                        reservation.status === 'cancelled' ? 'default' : 'success'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {reservation.status === 'confirmed' && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        color="error"
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                    {reservation.status === 'cancelled' && (
                      <Typography variant="body2" color="text.secondary">
                        Cancelled
                      </Typography>
                    )}
                    {reservation.status === 'completed' && (
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No reservations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          onClick={() => window.history.back()}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default MyReservationsPage;