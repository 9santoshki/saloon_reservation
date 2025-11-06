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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
}

const AdminDashboard: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  
  // Form state for adding/updating stores
  const [storeForm, setStoreForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    latitude: 0,
    longitude: 0,
    opening_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '20:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: '11:00', close: '16:00' },
    },
  });
  
  // Check if user is admin
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
      navigate('/admin/login');
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
    setStores([
      {
        id: 1,
        name: 'Serenity Spa',
        address: '123 Wellness Blvd, New York, NY 10001',
        phone: '+15550123',
        email: 'info@serenityspa.com',
        description: 'A premium spa offering massage therapy, facials, and wellness services.',
      },
      {
        id: 2,
        name: 'Pure Beauty Salon',
        address: '456 Fashion Ave, New York, NY 10016',
        phone: '+15550124',
        email: 'hello@purebeautysalon.com',
        description: 'Trendy salon offering haircuts, styling, nails, and makeup services.',
      },
    ]);
  }, []);

  const handleAddStore = () => {
    // In a real app, this would call an API
    const newStore: Store = {
      id: Date.now(), // Mock ID
      ...storeForm,
    };
    setStores([...stores, newStore]);
    setShowAddStoreDialog(false);
    setStoreForm({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      latitude: 0,
      longitude: 0,
      opening_hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: '11:00', close: '16:00' },
      },
    });
  };

  const handleCancelAddStore = () => {
    setShowAddStoreDialog(false);
    setStoreForm({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      latitude: 0,
      longitude: 0,
      opening_hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: '11:00', close: '16:00' },
      },
    });
  };

  const handleDeleteStore = (id: number) => {
    // In a real app, this would call an API to delete
    setStores(stores.filter(store => store.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">Admin Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Manage Stores" />
          <Tab label="Manage Services" />
          <Tab label="Manage Users" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Stores</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setShowAddStoreDialog(true)}
            >
              Add Store
            </Button>
          </Box>

          <Grid container spacing={3}>
            {stores.map((store) => (
              <Grid item xs={12} sm={6} md={4} key={store.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {store.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {store.phone} | {store.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {store.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteStore(store.id)}
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
            Services
          </Typography>
          <Alert severity="info">
            This section allows you to manage services across all stores. Each store can have different services.
          </Alert>
          {/* Services management would go here */}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Users
          </Typography>
          <Alert severity="info">
            This section allows you to manage application users (admin and store owners).
          </Alert>
          {/* Users management would go here */}
        </Box>
      )}

      {/* Add Store Dialog */}
      <Dialog open={showAddStoreDialog} onClose={handleCancelAddStore} maxWidth="md" fullWidth>
        <DialogTitle>Add New Store</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Store Name"
              fullWidth
              variant="outlined"
              value={storeForm.name}
              onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              variant="outlined"
              value={storeForm.address}
              onChange={(e) => setStoreForm({...storeForm, address: e.target.value})}
              sx={{ mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              variant="outlined"
              value={storeForm.phone}
              onChange={(e) => setStoreForm({...storeForm, phone: e.target.value})}
              sx={{ mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              variant="outlined"
              value={storeForm.email}
              onChange={(e) => setStoreForm({...storeForm, email: e.target.value})}
              sx={{ mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={storeForm.description}
              onChange={(e) => setStoreForm({...storeForm, description: e.target.value})}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAddStore}>Cancel</Button>
          <Button onClick={handleAddStore} variant="contained">Add Store</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;