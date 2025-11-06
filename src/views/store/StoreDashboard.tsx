import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  store_id: number;
}

interface Reservation {
  id: number;
  user_name: string;
  service_name: string;
  reservation_date: string;
  reservation_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

const StoreDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  
  // Form state for adding services
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
  });
  
  // Check if user is store owner
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== 'store_owner') {
      navigate('/store/login');
    }
  }, [authState, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from the API
    setServices([
      {
        id: 1,
        name: 'Swedish Massage',
        description: 'Relaxing full-body massage using oil to release muscle tension',
        duration: 60,
        price: 80.00,
        store_id: authState.user?.store_id || 1,
      },
      {
        id: 2,
        name: 'Deep Tissue Massage',
        description: 'Intensive massage targeting deeper layers of muscle and connective tissue',
        duration: 60,
        price: 95.00,
        store_id: authState.user?.store_id || 1,
      },
      {
        id: 3,
        name: 'Facial Treatment',
        description: 'Hydrating facial with cleansing, exfoliating, and moisturizing',
        duration: 45,
        price: 65.00,
        store_id: authState.user?.store_id || 1,
      },
    ]);
    
    // Mock reservations
    setReservations([
      {
        id: 1,
        user_name: 'John Doe',
        service_name: 'Swedish Massage',
        reservation_date: '2024-12-20',
        reservation_time: '14:30',
        status: 'confirmed',
      },
      {
        id: 2,
        user_name: 'Jane Smith',
        service_name: 'Facial Treatment',
        reservation_date: '2024-12-21',
        reservation_time: '10:00',
        status: 'confirmed',
      },
      {
        id: 3,
        user_name: 'Robert Johnson',
        service_name: 'Deep Tissue Massage',
        reservation_date: '2024-12-19',
        reservation_time: '16:00',
        status: 'completed',
      },
    ]);
  }, [authState]);

  const handleAddService = () => {
    // In a real app, this would call an API
    const newService: Service = {
      id: Date.now(), // Mock ID
      ...serviceForm,
      store_id: authState.user?.store_id || 1,
    };
    setServices([...services, newService]);
    setShowAddServiceDialog(false);
    setServiceForm({
      name: '',
      description: '',
      duration: 30,
      price: 0,
    });
  };

  const handleCancelAddService = () => {
    setShowAddServiceDialog(false);
    setServiceForm({
      name: '',
      description: '',
      duration: 30,
      price: 0,
    });
  };

  const handleDeleteService = (id: number) => {
    // In a real app, this would call an API to delete
    setServices(services.filter(service => service.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">Store Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Manage Services" />
          <Tab label="View Reservations" />
          <Tab label="Manage Store" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Services</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setShowAddServiceDialog(true)}
            >
              Add Service
            </Button>
          </Box>

          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item component="div" xs={12} sm={6} md={4} key={service.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={`${service.duration} min`} size="small" />
                      <Chip label={`$${service.price.toFixed(2)}`} size="small" sx={{ ml: 1 }} />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Reservations
          </Typography>
          
          <List>
            {reservations.map((reservation) => (
              <ListItem key={reservation.id} divider>
                <ListItemText
                  primary={`${reservation.service_name} - ${reservation.user_name}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {formatDate(reservation.reservation_date)} at {reservation.reservation_time}
                      </Typography>
                      <br />
                      <Chip 
                        label={reservation.status} 
                        size="small"
                        color={
                          reservation.status === 'confirmed' ? 'primary' : 
                          reservation.status === 'cancelled' ? 'default' : 'success'
                        }
                      />
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="view">
                    <EventIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Store Information
          </Typography>
          <Alert severity="info">
            This section allows you to manage your store details such as name, address, opening hours, etc.
          </Alert>
          {/* Store management would go here */}
        </Box>
      )}

      {/* Add Service Dialog */}
      <Dialog open={showAddServiceDialog} onClose={handleCancelAddService} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Service Name"
              fullWidth
              variant="outlined"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={serviceForm.description}
              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
              sx={{ mt: 1 }}
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item component="div" xs={6}>
                <TextField
                  margin="dense"
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({...serviceForm, duration: parseInt(e.target.value) || 0})}
                />
              </Grid>
              <Grid item component="div" xs={6}>
                <TextField
                  margin="dense"
                  label="Price ($)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({...serviceForm, price: parseFloat(e.target.value) || 0})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAddService}>Cancel</Button>
          <Button onClick={handleAddService} variant="contained">Add Service</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreDashboard;