import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import type { Store, Service, BookingRequest } from '../types';
import { mockStores, mockUsers, mockServices } from '../utils/mockData';
import PaymentForm from '../components/PaymentForm';
import { createReservation } from '../api/reservationService';
import type { SelectChangeEvent } from '@mui/material/Select';

const BookingPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // User information (in a real app, this would come from auth)
  const [user] = useState(mockUsers[0]);
  
  const [activeStep, setActiveStep] = useState(0);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const id = parseInt(storeId || '0', 10);
    const foundStore = mockStores.find(s => s.id === id);
    setStore(foundStore || null);
  }, [storeId]);

  const handleServiceChange = (event: SelectChangeEvent) => {
    const serviceId = parseInt(event.target.value);
    if (store) {
      const service = store.services.find(s => s.id === serviceId);
      setSelectedService(service || null);
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(event.target.value);
  };

  const handleConfirmBooking = () => {
    if (!store || !selectedService || !selectedDate || !selectedTime) {
      setBookingError('Please fill in all required fields');
      return;
    }

    // In a real app, this would send a request to the backend
    // For now, we'll just simulate a successful booking
    const bookingData: BookingRequest = {
      user_id: user.id,
      store_id: store.id,
      reservation_date: selectedDate.format('YYYY-MM-DD'),
      reservation_time: selectedTime,
      service_type: selectedService.name,
      duration: selectedService.duration,
      total_amount: selectedService.price,
    };

    console.log('Booking data:', bookingData);
    
    // Open payment form instead of directly confirming
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!store || !selectedService || !selectedDate || !selectedTime) {
      setBookingError('Booking details are incomplete');
      return;
    }
    
    setPaymentCompleted(true);
    setPaymentOpen(false);
    
    try {
      // Prepare the booking data
      const bookingData = {
        user_id: user.id,
        store_id: store.id,
        service_id: selectedService.id,
        reservation_date: selectedDate.format('YYYY-MM-DD'),
        reservation_time: selectedTime,
        duration: selectedService.duration,
        total_amount: selectedService.price,
        payment_method: paymentDetails.payment_method,
        payment_status: 'paid',
      };
      
      // Send the booking request to the backend
      await createReservation(bookingData);
      
      // Update the UI to show success
      setBookingConfirmed(true);
    } catch (error) {
      console.error('Error creating reservation:', error);
      setBookingError('Failed to create reservation. Please try again.');
    }
  };

  const handlePaymentClose = () => {
    setPaymentOpen(false);
  };

  const handleCancelBooking = () => {
    navigate('/');
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate service selection
      if (!selectedService) {
        setBookingError('Please select a service');
        return;
      }
      setBookingError(null);
    } else if (activeStep === 1) {
      // Validate date and time
      if (!selectedDate || !selectedTime) {
        setBookingError('Please select a date and time');
        return;
      }
      setBookingError(null);
    }
    
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const steps = [
    {
      label: 'Select Service',
      description: `Choose a service from ${store?.name}`,
    },
    {
      label: 'Select Date & Time',
      description: 'Pick your preferred date and time',
    },
    {
      label: 'Confirm Booking',
      description: 'Review and confirm your reservation',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Book Your Appointment
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {index === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Services at {store?.name}
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel id="service-select-label">Select Service</InputLabel>
                      <Select
                        labelId="service-select-label"
                        value={selectedService?.id?.toString() || ''}
                        label="Select Service"
                        onChange={handleServiceChange}
                      >
                        {mockServices
                          .filter(service => service.store_id === store?.id)
                          .map((service) => (
                          <MenuItem key={service.id} value={service.id.toString()}>
                            {service.name} - ${service.price.toFixed(2)} ({service.duration} min)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {selectedService && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">{selectedService.name}</Typography>
                        <Typography variant="body1">{selectedService.description}</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          Duration: {selectedService.duration} minutes
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Price: ${selectedService.price.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                {index === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Select Date & Time
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select Date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        minDate={dayjs()}
                        sx={{ width: '100%', mt: 2 }}
                      />
                    </LocalizationProvider>
                    
                    <TextField
                      fullWidth
                      label="Select Time"
                      type="time"
                      value={selectedTime}
                      onChange={handleTimeChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 min
                      }}
                      sx={{ mt: 2 }}
                    />
                    
                    {store && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">Store Opening Hours</Typography>
                        {selectedDate && (
                          <Typography variant="body1">
                            {store.opening_hours[selectedDate.format('dddd').toLowerCase()]?.open} - 
                            {store.opening_hours[selectedDate.format('dddd').toLowerCase()]?.close}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
                
                {index === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Booking Summary
                    </Typography>
                    {bookingConfirmed ? (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Your booking has been confirmed! We've sent a confirmation email to {user.email}.
                      </Alert>
                    ) : (
                      <Box>
                        <Typography variant="body1">
                          <strong>Store:</strong> {store?.name}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Service:</strong> {selectedService?.name}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Date:</strong> {selectedDate?.format('MMMM D, YYYY')}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Time:</strong> {selectedTime}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Duration:</strong> {selectedService?.duration} minutes
                        </Typography>
                        <Typography variant="body1">
                          <strong>Total:</strong> ${selectedService?.price.toFixed(2)}
                        </Typography>
                        
                        {!paymentCompleted && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            Payment is required to confirm your booking.
                          </Alert>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
                
                {bookingError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {bookingError}
                  </Alert>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <div>
                    {index < steps.length - 1 && (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue
                      </Button>
                    )}
                    {index === steps.length - 1 && !bookingConfirmed && !paymentOpen && (
                      <Button
                        variant="contained"
                        onClick={handleConfirmBooking}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Proceed to Payment
                      </Button>
                    )}
                    {index > 0 && (
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    )}
                    {bookingConfirmed && (
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/reservations')}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        View Reservations
                      </Button>
                    )}
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <PaymentForm
        open={paymentOpen}
        onClose={handlePaymentClose}
        amount={selectedService?.price || 0}
        onPaymentSuccess={handlePaymentSuccess}
      />
      
      <Box textAlign="center">
        <Button 
          variant="outlined" 
          onClick={handleCancelBooking}
        >
          Cancel Booking
        </Button>
      </Box>
    </Container>
  );
};

export default BookingPage;