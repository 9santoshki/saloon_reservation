import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  InputAdornment,
  Autocomplete,
  TextField,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TodayIcon from '@mui/icons-material/Today';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MapWithChat from '../components/MapWithChat';
import type { Store, Service } from '../types';
import { mockStores, mockServices } from '../utils/mockData';

const HomePage: React.FC = () => {
  const [stores] = useState<Store[]>(mockStores);
  const [filteredStores, setFilteredStores] = useState<Store[]>(mockStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Current date by default
  );
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Get unique service names for autocomplete
  const allServices = Array.from(
    new Set(mockServices.map(service => service.name))
  );

  // Get unique locations for autocomplete
  const allLocations = Array.from(
    new Set(mockStores.map(store => store.address))
  );

  const handleStoreSelect = (store: Store | null) => {
    setSelectedStore(store);
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Simple header */}
      <Box sx={{ p: 2, bgcolor: 'white', boxShadow: 1, textAlign: 'center' }}>
        <Typography variant="h4">
          Saloon & SPA Reservation
        </Typography>
      </Box>
      
      {/* Search Section - full width */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'white', 
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={allServices}
              value={selectedService}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Service"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              onInputChange={(_, value) => setSelectedService(value || '')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={allLocations}
              value={selectedLocation}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              onInputChange={(_, value) => setSelectedLocation(value || '')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              variant="outlined"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TodayIcon />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              freeSolo
              options={[
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
              ]}
              value={selectedTime}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Time"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              onInputChange={(_, value) => setSelectedTime(value || '')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main content area - full width */}
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        height: 'calc(100vh - 160px)', // Adjusted for search box height
        position: 'relative'
      }}>
        {/* Left panel - 25% width for store list */}
        <Box sx={{ 
          width: '25%', 
          height: '100%', 
          overflowY: 'auto', 
          p: 2,
          borderRight: '1px solid #e0e0e0',
          bgcolor: 'white'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Available Stores
          </Typography>
          {stores.map((store) => {
            // Get services for this store
            const storeServices = mockServices.filter(
              service => service.store_id === store.id
            );
            
            return (
              <Box 
                key={store.id}
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
                onClick={() => handleStoreSelect(store)}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                  {store.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {store.address}
                </Typography>
                
                {/* Services with available times */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Available Services:
                  </Typography>
                  {storeServices.map((service) => (
                    <Chip
                      key={service.id}
                      label={`${service.name} - ${service.price} (${service.duration}min)`}
                      size="small"
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5, 
                        bgcolor: '#e3f2fd',
                        '&:hover': {
                          bgcolor: '#bbdefb'
                        }
                      }}
                    />
                  ))}
                </Box>
                
                {/* Available times */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Available Times:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                      <Chip
                        key={time}
                        label={time}
                        size="small"
                        sx={{ 
                          mr: 0.5, 
                          mb: 0.5, 
                          bgcolor: '#e8f5e9',
                          '&:hover': {
                            bgcolor: '#c8e6c9'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
        
        {/* Right panel - 75% width for map */}
        <Box sx={{ 
          width: '75%', 
          height: '100%',
          position: 'relative'
        }}>
          <MapWithChat 
            stores={filteredStores} 
            selectedStore={selectedStore} 
            onStoreSelect={handleStoreSelect} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;