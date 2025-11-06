// Mock data for the AI agent to reference
export const mockStores = [
  {
    id: 1,
    name: "Glamour Spa & Salon",
    address: "123 Main St, New York, NY",
    latitude: 40.7128,
    longitude: -74.0060,
    phone: "(212) 555-0123",
    email: "info@glamourspa.com",
    description: "Premium spa and salon services in the heart of Manhattan",
    opening_hours: {
      Monday: { open: "09:00", close: "20:00" },
      Tuesday: { open: "09:00", close: "20:00" },
      Wednesday: { open: "09:00", close: "20:00" },
      Thursday: { open: "09:00", close: "21:00" },
      Friday: { open: "09:00", close: "21:00" },
      Saturday: { open: "08:00", close: "19:00" },
      Sunday: { open: "10:00", close: "18:00" }
    }
  },
  {
    id: 2,
    name: "Elegant Cuts & Colors",
    address: "456 Park Ave, New York, NY", 
    latitude: 40.7589,
    longitude: -73.9851,
    phone: "(212) 555-0456",
    email: "hello@elegantcuts.com",
    description: "Specializing in haircuts, coloring, and styling",
    opening_hours: {
      Monday: { open: "10:00", close: "19:00" },
      Tuesday: { open: "10:00", close: "19:00" },
      Wednesday: { open: "10:00", close: "19:00" },
      Thursday: { open: "10:00", close: "20:00" },
      Friday: { open: "10:00", close: "20:00" },
      Saturday: { open: "08:00", close: "18:00" },
      Sunday: { open: "10:00", close: "16:00" }
    }
  },
  {
    id: 3,
    name: "Relaxation Station",
    address: "789 Broadway, New York, NY",
    latitude: 40.7282,
    longitude: -73.9942,
    phone: "(212) 555-0789",
    email: "contact@relaxstation.com",
    description: "Perfect place for massages, facials, and relaxation",
    opening_hours: {
      Monday: { open: "09:00", close: "21:00" },
      Tuesday: { open: "09:00", close: "21:00" },
      Wednesday: { open: "09:00", close: "21:00" },
      Thursday: { open: "09:00", close: "22:00" },
      Friday: { open: "09:00", close: "22:00" },
      Saturday: { open: "08:00", close: "20:00" },
      Sunday: { open: "10:00", close: "18:00" }
    }
  }
];

export const mockServices = [
  { id: 1, name: "Haircut", description: "Professional haircut with styling", duration: 30, price: 45.00, store_id: 1 },
  { id: 2, name: "Hair Color", description: "Full color service", duration: 120, price: 120.00, store_id: 1 },
  { id: 3, name: "Manicure", description: "Classic nail care and polish", duration: 45, price: 30.00, store_id: 1 },
  { id: 4, name: "Pedicure", description: "Luxury foot treatment", duration: 60, price: 45.00, store_id: 1 },
  { id: 5, name: "Deep Tissue Massage", description: "Therapeutic deep tissue massage", duration: 60, price: 85.00, store_id: 3 },
  { id: 6, name: "Facial", description: "Customized facial treatment", duration: 60, price: 75.00, store_id: 3 },
  { id: 7, name: "Cut & Style", description: "Haircut with styling and blowout", duration: 60, price: 65.00, store_id: 2 },
  { id: 8, name: "Hair Treatment", description: "Intensive conditioning treatment", duration: 45, price: 55.00, store_id: 2 }
];