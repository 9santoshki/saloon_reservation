import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import type { Store, Service } from '../types';
import { mockStores, mockServices } from '../utils/mockData';
import MapWithChat from '../components/MapWithChat';

const StoreDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const storeId = parseInt(id || '0', 10);
    const foundStore = mockStores.find(s => s.id === storeId);
    setStore(foundStore || null);
  }, [id]);

  const handleBookNow = () => {
    if (store) {
      navigate(`/book/${store.id}`);
    }
  };

  if (!store) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">Store not found</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom>
            {store.name}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Address</Typography>
            <Typography variant="body1">{store.address}</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Phone: {store.phone} | Email: {store.email}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">About</Typography>
            <Typography variant="body1">{store.description}</Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Opening Hours</Typography>
            <List>
              {Object.entries(store.opening_hours).map(([day, hours]) => (
                <ListItem key={day} sx={{ p: 0 }}>
                  <ListItemText 
                    primary={day.charAt(0).toUpperCase() + day.slice(1)} 
                    secondary={`${hours.open} - ${hours.close}`} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Services</Typography>
            <Grid container spacing={2}>
              {mockServices
                .filter(service => service.store_id === store.id)
                .map((service) => (
                <Grid item xs={12} sm={6} key={service.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Duration: {service.duration} min</Typography>
                        <Typography>${service.price.toFixed(2)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Location
                </Typography>
                <MapWithChat 
                  stores={[store]} 
                  selectedStore={store}
                  userLocation={{ lat: store.latitude, lng: store.longitude }}
                />
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Rating value={4.5} readOnly precision={0.5} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    4.5 (128 reviews)
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    size="large" 
                    sx={{ mt: 2, width: '100%' }}
                    onClick={handleBookNow}
                  >
                    Book Now
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 1, width: '100%' }}
                    onClick={() => navigate('/')}
                  >
                    Back to All Stores
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StoreDetailsPage;