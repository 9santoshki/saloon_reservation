import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { mockStores, mockServices } from './mockData';

// Initialize dotenv
dotenv.config();

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors);
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'saloon_reservation',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Authentication middleware
interface AuthRequest extends Request {
  userId?: number;
  role?: string;
  storeId?: number | null;
}

const authenticateToken = (req: AuthRequest, res: Response, next: () => void) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.userId = decoded.id;
    req.role = decoded.role;
    req.storeId = decoded.store_id;
    next();
  });
};

// Admin authorization middleware
const requireAdmin = (req: AuthRequest, res: Response, next: () => void) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Store owner authorization middleware
const requireStoreOwner = (req: AuthRequest, res: Response, next: () => void) => {
  if (req.role !== 'store_owner') {
    return res.status(403).json({ error: 'Store owner access required' });
  }
  next();
};

// Store owner authorization middleware for specific store
const requireStoreOwnerForStore = (req: AuthRequest, res: Response, next: () => void) => {
  if (req.role !== 'store_owner') {
    return res.status(403).json({ error: 'Store owner access required' });
  }
  
  const requestedStoreId = parseInt(req.params.storeId || req.params.id || '0', 10);
  if (req.storeId !== requestedStoreId) {
    return res.status(403).json({ error: 'Not authorized for this store' });
  }
  
  next();
};

// Test database connection
pool.query('SELECT NOW()', (err: Error, _res: any) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Saloon Reservation API is running!' });
});

// Get all reservations for a user
app.get('/api/reservations/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM reservations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single reservation
app.get('/api/reservations/:userId/:reservationId', async (req: Request, res: Response) => {
  try {
    const { userId, reservationId } = req.params;
    const result = await pool.query(
      'SELECT * FROM reservations WHERE user_id = $1 AND id = $2',
      [userId, reservationId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new reservation
app.post('/api/reservations', async (req: Request, res: Response) => {
  try {
    const { user_id, store_id, service_id, reservation_date, reservation_time, 
            duration, total_amount, payment_method } = req.body;
    
    const result = await pool.query(
      `INSERT INTO reservations 
       (user_id, store_id, service_id, reservation_date, reservation_time, 
        duration, total_amount, payment_method, payment_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'paid') 
       RETURNING *`,
      [user_id, store_id, service_id, reservation_date, reservation_time, 
       duration, total_amount, payment_method]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a reservation
app.put('/api/reservations/:reservationId/cancel', async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [reservationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all stores
app.get('/api/stores', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM stores ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single store
app.get('/api/stores/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Authentication endpoints

// Register app user (for testing purposes)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, store_id } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO app_users (username, email, password_hash, role, store_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, email, role, store_id, created_at, updated_at`,
      [username, email, hashedPassword, role, store_id]
    );
    
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, store_id: user.store_id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        store_id: user.store_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM app_users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, store_id: user.store_id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        store_id: user.store_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all app users
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, store_id, created_at, updated_at FROM app_users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create a new store
app.post('/api/admin/stores', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, latitude, longitude, phone, email, description, opening_hours } = req.body;
    
    const result = await pool.query(
      `INSERT INTO stores (name, address, latitude, longitude, phone, email, description, opening_hours) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, address, latitude, longitude, phone, email, description, JSON.stringify(opening_hours)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update a store
app.put('/api/admin/stores/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, phone, email, description, opening_hours } = req.body;
    
    const result = await pool.query(
      `UPDATE stores 
       SET name = $1, address = $2, latitude = $3, longitude = $4, 
           phone = $5, email = $6, description = $7, opening_hours = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, address, latitude, longitude, phone, email, description, JSON.stringify(opening_hours), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete a store
app.delete('/api/admin/stores/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM stores WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store owner: Get my store details
app.get('/api/store/my', authenticateToken, requireStoreOwner, async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.storeId;
    
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [storeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store owner: Update my store details
app.put('/api/store/my', authenticateToken, requireStoreOwner, async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.storeId; // Store ID from JWT token
    
    const { name, address, latitude, longitude, phone, email, description, opening_hours } = req.body;
    
    const result = await pool.query(
      `UPDATE stores 
       SET name = $1, address = $2, latitude = $3, longitude = $4, 
           phone = $5, email = $6, description = $7, opening_hours = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, address, latitude, longitude, phone, email, description, JSON.stringify(opening_hours), storeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin & Store owner: Get all services for a store
app.get('/api/services/store/:storeId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;
    
    // Check if user is store owner and if so, ensure they're accessing their own store
    if (req.role === 'store_owner' && req.storeId !== parseInt(storeId)) {
      return res.status(403).json({ error: 'Not authorized to access this store' });
    }
    
    const result = await pool.query(
      'SELECT * FROM services WHERE store_id = $1 ORDER BY name',
      [storeId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin & Store owner: Get all services
app.get('/api/services', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // For store owners, only return services from their store
    let result;
    if (req.role === 'store_owner') {
      result = await pool.query(
        'SELECT * FROM services WHERE store_id = $1 ORDER BY name',
        [req.storeId]
      );
    } else {
      result = await pool.query('SELECT * FROM services ORDER BY name');
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store owner: Add a new service to my store
app.post('/api/store/services', authenticateToken, requireStoreOwner, async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.storeId; // Store ID from JWT token
    
    const { name, description, duration, price } = req.body;
    
    const result = await pool.query(
      `INSERT INTO services (name, description, duration, price, store_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, description, duration, price, storeId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store owner: Update a service
app.put('/api/store/services/:id', authenticateToken, requireStoreOwner, async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.storeId; // Store ID from JWT token
    
    const { id } = req.params;
    const { name, description, duration, price } = req.body;
    
    // Verify that the service belongs to the store owner's store
    const serviceCheck = await pool.query(
      'SELECT id FROM services WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );
    
    if (serviceCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this service' });
    }
    
    const result = await pool.query(
      `UPDATE services 
       SET name = $1, description = $2, duration = $3, price = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, description, duration, price, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store owner: Delete a service
app.delete('/api/store/services/:id', authenticateToken, requireStoreOwner, async (req: AuthRequest, res: Response) => {
  try {
    const storeId = req.storeId; // Store ID from JWT token
    
    const { id } = req.params;
    
    // Verify that the service belongs to the store owner's store
    const serviceCheck = await pool.query(
      'SELECT id FROM services WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );
    
    if (serviceCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this service' });
    }
    
    const result = await pool.query(
      `DELETE FROM services WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Agent Chat endpoint - proxy to Python AI agent
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    console.log('Received AI chat request:', req.body.message.substring(0, 50) + '...'); // Log the request
    const response = await axios.post('http://localhost:5001/api/ai/chat', req.body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    console.log('Forwarded response from Python AI agent');
    res.json(response.data);
  } catch (err: any) {
    console.error('AI Chat error:', err.message || err);
    res.status(500).json({ error: `AI service error: ${err.message || 'Unknown error'}` });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});