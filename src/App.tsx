import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './views/HomePage';
import StoreDetailsPage from './views/StoreDetailsPage';
import BookingPage from './views/BookingPage';
import MyReservationsPage from './views/MyReservationsPage';
import AdminLogin from './views/admin/AdminLogin';
import AdminDashboard from './views/admin/AdminDashboard';
import StoreLogin from './views/store/StoreLogin';
import StoreDashboard from './views/store/StoreDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e57373',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BookingProvider>
          <Router>
            <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/store/:id" element={<StoreDetailsPage />} />
                <Route path="/book/:storeId" element={<BookingPage />} />
                <Route path="/reservations" element={<MyReservationsPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/store/login" element={<StoreLogin />} />
                <Route path="/store" element={<StoreDashboard />} />
              </Routes>
            </div>
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
