import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import ChatPanel from './ChatPanel';
import type { Store } from '../types';
import { mockStores } from '../utils/mockData';

interface MapWithChatProps {
  userLocation?: { lat: number; lng: number };
  stores?: Store[];
  selectedStore?: Store | null;
  onStoreSelect?: (store: Store | null) => void;
  storeId?: number;
  serviceId?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default to New York City coordinates if user location is not available
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const MapWithChat: React.FC<MapWithChatProps> = ({ 
  userLocation = defaultCenter, 
  stores = mockStores, 
  selectedStore = null,
  onStoreSelect = () => {},
  storeId,
  serviceId
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null); // Used in GoogleMap onLoad and onUnmount
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(
    stores.length > 0 ? 
    { lat: stores[0].latitude, lng: stores[0].longitude } : 
    userLocation
  );
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(userPos);
          
          // Keep the initial center on the first store, but store user location for distance calculation
          if (stores.length === 0) {
            setCenter(userPos);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to default location if user denies location access
          setCurrentLocation(defaultCenter);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setCurrentLocation(defaultCenter);
    }
  }, [stores]);

  const handleMapLoad = (loadedMap: google.maps.Map) => {
    setMap(loadedMap);
  };

  const handleMapUnmount = () => {
    setMap(null);
  };

  const handleStoreSelection = (store: Store) => {
    setCenter({ lat: store.latitude, lng: store.longitude });
    onStoreSelect(store);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Map Section */}
      <Box sx={{ 
        width: '100%', 
        height: '70%',  // 70% for map, 30% for chat
        position: 'relative'
      }}>
        {isLoaded ? (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: 2, 
            overflow: 'hidden', 
            boxShadow: 2,
            position: 'relative'
          }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={handleMapLoad}
              onUnmount={handleMapUnmount}
              options={{
                zoomControl: false, // We'll implement our own controls
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {/* Marker for user's current location */}
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(32, 32),
                  }}
                  title="Your current location"
                />
              )}

              {/* Markers for all stores */}
              {stores.map((store, index) => {
                // Generate label: A, B, C, ... (up to Z, then AA, AB, etc.)
                let label = '';
                let n = index + 1;
                while (n > 0) {
                  n--;
                  label = String.fromCharCode(65 + (n % 26)) + label;
                  n = Math.floor(n / 26);
                }
                
                return (
                  <Marker
                    key={store.id}
                    position={{ lat: store.latitude, lng: store.longitude }}
                    label={label}
                    onClick={() => handleStoreSelection(store)}
                  >
                    {selectedStore?.id === store.id && (
                      <InfoWindow
                        position={{ lat: store.latitude, lng: store.longitude }}
                        onCloseClick={() => handleStoreSelection(null as any)}
                      >
                        <Box>
                          <Typography variant="h6">{store.name}</Typography>
                          <Typography variant="body2">{store.address}</Typography>
                          <Typography variant="body2">Distance: {currentLocation ? calculateDistance(currentLocation, { lat: store.latitude, lng: store.longitude }).toFixed(2) : 'N/A'} km</Typography>
                        </Box>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}
            </GoogleMap>
            
            {/* Custom Zoom Controls */}
            <Box sx={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
            }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  if (map) {
                    map.setZoom(map.getZoom() + 1);
                  }
                }}
                sx={{
                  minWidth: '30px',
                  height: '30px',
                  padding: 0,
                  marginBottom: '4px',
                  borderRadius: '2px',
                }}
              >
                +
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  if (map) {
                    map.setZoom(map.getZoom() - 1);
                  }
                }}
                sx={{
                  minWidth: '30px',
                  height: '30px',
                  padding: 0,
                  borderRadius: '2px',
                }}
              >
                -
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>Loading Map...</Typography>
          </Box>
        )}
      </Box>

      {/* Chat Panel Section */}
      <Box sx={{ 
        width: '100%', 
        height: '30%',  // 30% for the chat panel
        mt: 1,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <ChatPanel storeId={storeId} serviceId={serviceId} />
      </Box>
    </Box>
  );
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (
  pos1: google.maps.LatLngLiteral | null, 
  pos2: google.maps.LatLngLiteral
): number => {
  if (!pos1) return 0;
  
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(pos2.lat - pos1.lat);
  const dLon = deg2rad(pos2.lng - pos1.lng);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export default MapWithChat;