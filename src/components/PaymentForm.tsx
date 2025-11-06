import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: (paymentDetails: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  open, 
  onClose, 
  amount, 
  onPaymentSuccess 
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const validateForm = () => {
    if (!cardholderName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    
    if (paymentMethod === 'credit_card') {
      if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!cvv.match(/^\d{3,4}$/)) {
        setError('Please enter a valid CVV');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess({
        payment_method: paymentMethod,
        amount: amount,
        timestamp: new Date().toISOString(),
        transaction_id: `txn_${Date.now()}`,
      });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Complete Your Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Amount: ${amount.toFixed(2)}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="payment-method-label">Payment Method</InputLabel>
              <Select
                labelId="payment-method-label"
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
              </Select>
            </FormControl>
            
            {paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? (
              <>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  margin="normal"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    margin="normal"
                    placeholder="MM/YY"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    margin="normal"
                    placeholder="123"
                    required
                  />
                </Box>
              </>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                You will be redirected to PayPal to complete your payment.
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentForm;