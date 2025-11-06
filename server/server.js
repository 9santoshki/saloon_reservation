var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { mockStores, mockServices } from './mockData';
// Initialize dotenv
dotenv.config();
dotenv.config();
var app = express();
var port = process.env.PORT || 3001;
// Middleware
app.use(cors.default());
app.use(express.json());
// PostgreSQL connection
var pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'saloon_reservation',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});
var authenticateToken = function (req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', function (err, decoded) {
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
var requireAdmin = function (req, res, next) {
    if (req.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
// Store owner authorization middleware
var requireStoreOwner = function (req, res, next) {
    if (req.role !== 'store_owner') {
        return res.status(403).json({ error: 'Store owner access required' });
    }
    next();
};
// Store owner authorization middleware for specific store
var requireStoreOwnerForStore = function (req, res, next) {
    if (req.role !== 'store_owner') {
        return res.status(403).json({ error: 'Store owner access required' });
    }
    var requestedStoreId = parseInt(req.params.storeId || req.params.id || '0', 10);
    if (req.storeId !== requestedStoreId) {
        return res.status(403).json({ error: 'Not authorized for this store' });
    }
    next();
};
// Test database connection
pool.query('SELECT NOW()', function (err, _res) {
    if (err) {
        console.error('Database connection error:', err.stack);
    }
    else {
        console.log('Database connected successfully');
    }
});
// Routes
app.get('/', function (_req, res) {
    res.json({ message: 'Saloon Reservation API is running!' });
});
// Get all reservations for a user
app.get('/api/reservations/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                return [4 /*yield*/, pool.query('SELECT * FROM reservations WHERE user_id = $1 ORDER BY created_at DESC', [userId])];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get a single reservation
app.get('/api/reservations/:userId/:reservationId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, reservationId, result, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.params, userId = _a.userId, reservationId = _a.reservationId;
                return [4 /*yield*/, pool.query('SELECT * FROM reservations WHERE user_id = $1 AND id = $2', [userId, reservationId])];
            case 1:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Reservation not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _b.sent();
                console.error(err_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create a new reservation
app.post('/api/reservations', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, user_id, store_id, service_id, reservation_date, reservation_time, duration, total_amount, payment_method, result, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, user_id = _a.user_id, store_id = _a.store_id, service_id = _a.service_id, reservation_date = _a.reservation_date, reservation_time = _a.reservation_time, duration = _a.duration, total_amount = _a.total_amount, payment_method = _a.payment_method;
                return [4 /*yield*/, pool.query("INSERT INTO reservations \n       (user_id, store_id, service_id, reservation_date, reservation_time, \n        duration, total_amount, payment_method, payment_status) \n       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'paid') \n       RETURNING *", [user_id, store_id, service_id, reservation_date, reservation_time,
                        duration, total_amount, payment_method])];
            case 1:
                result = _b.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _b.sent();
                console.error(err_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Cancel a reservation
app.put('/api/reservations/:reservationId/cancel', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reservationId, result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                reservationId = req.params.reservationId;
                return [4 /*yield*/, pool.query("UPDATE reservations \n       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP \n       WHERE id = $1 \n       RETURNING *", [reservationId])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Reservation not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                console.error(err_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all stores
app.get('/api/stores', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query('SELECT * FROM stores ORDER BY name')];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                console.error(err_5);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get a single store
app.get('/api/stores/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, pool.query('SELECT * FROM stores WHERE id = $1', [id])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Store not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                console.error(err_6);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Authentication endpoints
// Register app user (for testing purposes)
app.post('/api/auth/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, role, store_id, hashedPassword, result, user, token, err_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password, role = _a.role, store_id = _a.store_id;
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 1:
                hashedPassword = _b.sent();
                return [4 /*yield*/, pool.query("INSERT INTO app_users (username, email, password_hash, role, store_id) \n       VALUES ($1, $2, $3, $4, $5) \n       RETURNING id, username, email, role, store_id, created_at, updated_at", [username, email, hashedPassword, role, store_id])];
            case 2:
                result = _b.sent();
                user = result.rows[0];
                token = jwt.sign({ id: user.id, role: user.role, store_id: user.store_id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
                res.status(201).json({
                    token: token,
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
                return [3 /*break*/, 4];
            case 3:
                err_7 = _b.sent();
                console.error(err_7);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Login endpoint
app.post('/api/auth/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, result, user, validPassword, token, err_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, username = _a.username, password = _a.password;
                return [4 /*yield*/, pool.query('SELECT * FROM app_users WHERE username = $1', [username])];
            case 1:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                user = result.rows[0];
                return [4 /*yield*/, bcrypt.compare(password, user.password_hash)];
            case 2:
                validPassword = _b.sent();
                if (!validPassword) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                token = jwt.sign({ id: user.id, role: user.role, store_id: user.store_id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
                res.json({
                    token: token,
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
                return [3 /*break*/, 4];
            case 3:
                err_8 = _b.sent();
                console.error(err_8);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Admin: Get all app users
app.get('/api/admin/users', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query('SELECT id, username, email, role, store_id, created_at, updated_at FROM app_users ORDER BY created_at DESC')];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                err_9 = _a.sent();
                console.error(err_9);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Admin: Create a new store
app.post('/api/admin/stores', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, address, latitude, longitude, phone, email, description, opening_hours, result, err_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_1 = _a.name, address = _a.address, latitude = _a.latitude, longitude = _a.longitude, phone = _a.phone, email = _a.email, description = _a.description, opening_hours = _a.opening_hours;
                return [4 /*yield*/, pool.query("INSERT INTO stores (name, address, latitude, longitude, phone, email, description, opening_hours) \n       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) \n       RETURNING *", [name_1, address, latitude, longitude, phone, email, description, JSON.stringify(opening_hours)])];
            case 1:
                result = _b.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_10 = _b.sent();
                console.error(err_10);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Admin: Update a store
app.put('/api/admin/stores/:id', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name_2, address, latitude, longitude, phone, email, description, opening_hours, result, err_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, name_2 = _a.name, address = _a.address, latitude = _a.latitude, longitude = _a.longitude, phone = _a.phone, email = _a.email, description = _a.description, opening_hours = _a.opening_hours;
                return [4 /*yield*/, pool.query("UPDATE stores \n       SET name = $1, address = $2, latitude = $3, longitude = $4, \n           phone = $5, email = $6, description = $7, opening_hours = $8, updated_at = CURRENT_TIMESTAMP\n       WHERE id = $9\n       RETURNING *", [name_2, address, latitude, longitude, phone, email, description, JSON.stringify(opening_hours), id])];
            case 1:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Store not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_11 = _b.sent();
                console.error(err_11);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Admin: Delete a store
app.delete('/api/admin/stores/:id', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, err_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, pool.query("DELETE FROM stores WHERE id = $1 RETURNING id", [id])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Store not found' })];
                }
                res.status(200).json({ message: 'Store deleted successfully' });
                return [3 /*break*/, 3];
            case 2:
                err_12 = _a.sent();
                console.error(err_12);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Store owner: Get my store details
app.get('/api/store/my', authenticateToken, requireStoreOwner, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, result, err_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                storeId = req.storeId;
                return [4 /*yield*/, pool.query('SELECT * FROM stores WHERE id = $1', [storeId])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Store not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_13 = _a.sent();
                console.error(err_13);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Store owner: Update my store details
app.put('/api/store/my', authenticateToken, requireStoreOwner, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, _a, name_3, address, latitude, longitude, phone, email, description, opening_hours, result, err_14;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                storeId = req.storeId;
                _a = req.body, name_3 = _a.name, address = _a.address, latitude = _a.latitude, longitude = _a.longitude, phone = _a.phone, email = _a.email, description = _a.description, opening_hours = _a.opening_hours;
                return [4 /*yield*/, pool.query("UPDATE stores \n       SET name = $1, address = $2, latitude = $3, longitude = $4, \n           phone = $5, email = $6, description = $7, opening_hours = $8, updated_at = CURRENT_TIMESTAMP\n       WHERE id = $9\n       RETURNING *", [name_3, address, latitude, longitude, phone, email, description, JSON.stringify(opening_hours), storeId])];
            case 1:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Store not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_14 = _b.sent();
                console.error(err_14);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Admin & Store owner: Get all services for a store
app.get('/api/services/store/:storeId', authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, result, err_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                storeId = req.params.storeId;
                // Check if user is store owner and if so, ensure they're accessing their own store
                if (req.role === 'store_owner' && req.storeId !== parseInt(storeId)) {
                    return [2 /*return*/, res.status(403).json({ error: 'Not authorized to access this store' })];
                }
                return [4 /*yield*/, pool.query('SELECT * FROM services WHERE store_id = $1 ORDER BY name', [storeId])];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                err_15 = _a.sent();
                console.error(err_15);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Admin & Store owner: Get all services
app.get('/api/services', authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                result = void 0;
                if (!(req.role === 'store_owner')) return [3 /*break*/, 2];
                return [4 /*yield*/, pool.query('SELECT * FROM services WHERE store_id = $1 ORDER BY name', [req.storeId])];
            case 1:
                result = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, pool.query('SELECT * FROM services ORDER BY name')];
            case 3:
                result = _a.sent();
                _a.label = 4;
            case 4:
                res.json(result.rows);
                return [3 /*break*/, 6];
            case 5:
                err_16 = _a.sent();
                console.error(err_16);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Store owner: Add a new service to my store
app.post('/api/store/services', authenticateToken, requireStoreOwner, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, _a, name_4, description, duration, price, result, err_17;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                storeId = req.storeId;
                _a = req.body, name_4 = _a.name, description = _a.description, duration = _a.duration, price = _a.price;
                return [4 /*yield*/, pool.query("INSERT INTO services (name, description, duration, price, store_id) \n       VALUES ($1, $2, $3, $4, $5) \n       RETURNING *", [name_4, description, duration, price, storeId])];
            case 1:
                result = _b.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_17 = _b.sent();
                console.error(err_17);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Store owner: Update a service
app.put('/api/store/services/:id', authenticateToken, requireStoreOwner, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, id, _a, name_5, description, duration, price, serviceCheck, result, err_18;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                storeId = req.storeId;
                id = req.params.id;
                _a = req.body, name_5 = _a.name, description = _a.description, duration = _a.duration, price = _a.price;
                return [4 /*yield*/, pool.query('SELECT id FROM services WHERE id = $1 AND store_id = $2', [id, storeId])];
            case 1:
                serviceCheck = _b.sent();
                if (serviceCheck.rows.length === 0) {
                    return [2 /*return*/, res.status(403).json({ error: 'Not authorized to update this service' })];
                }
                return [4 /*yield*/, pool.query("UPDATE services \n       SET name = $1, description = $2, duration = $3, price = $4, updated_at = CURRENT_TIMESTAMP\n       WHERE id = $5\n       RETURNING *", [name_5, description, duration, price, id])];
            case 2:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Service not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 4];
            case 3:
                err_18 = _b.sent();
                console.error(err_18);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Store owner: Delete a service
app.delete('/api/store/services/:id', authenticateToken, requireStoreOwner, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, id, serviceCheck, result, err_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                storeId = req.storeId;
                id = req.params.id;
                return [4 /*yield*/, pool.query('SELECT id FROM services WHERE id = $1 AND store_id = $2', [id, storeId])];
            case 1:
                serviceCheck = _a.sent();
                if (serviceCheck.rows.length === 0) {
                    return [2 /*return*/, res.status(403).json({ error: 'Not authorized to delete this service' })];
                }
                return [4 /*yield*/, pool.query("DELETE FROM services WHERE id = $1 RETURNING id", [id])];
            case 2:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: 'Service not found' })];
                }
                res.status(200).json({ message: 'Service deleted successfully' });
                return [3 /*break*/, 4];
            case 3:
                err_19 = _a.sent();
                console.error(err_19);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Enhanced AI Agent Chat endpoint with specific saloon reservation capabilities
app.post('/api/ai/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, history_1, messages_1, ollamaResponse, err_20;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, message = _a.message, history_1 = _a.history;
                if (!message) {
                    return [2 /*return*/, res.status(400).json({ error: 'Message is required' })];
                }
                messages_1 = [];
                // Enhanced system message with specific agent capabilities
                messages_1.push({
                    role: "system",
                    content: "You are an intelligent Saloon & SPA Reservation Agent with specific capabilities:\n" +
                        "1. Find nearby saloons and spas\n" +
                        "2. Check service availability\n" +
                        "3. Provide pricing information\n" +
                        "4. Suggest appointment times\n" +
                        "5. Answer questions about services\n" +
                        "6. Provide location directions\n" +
                        "7. Explain cancellation policies\n\n" +
                        "Always be helpful, professional, and guide users to use the app for actual bookings. " +
                        "If asked about real-time availability, inform them that you can provide general information " +
                        "but they should use the app to check live availability and make bookings. " +
                        "You have access to the following mock data: " +
                        "Stores: " + JSON.stringify(mockStores.map(function (s) { return ({ id: s.id, name: s.name, address: s.address, phone: s.phone }); })) +
                        "Services: " + JSON.stringify(mockServices.map(function (s) { return ({ id: s.id, name: s.name, store_id: s.store_id, duration: s.duration, price: s.price }); })) +
                        "Be specific when responding to queries about these stores and services."
                });
                // Add conversation history to the messages
                if (history_1 && Array.isArray(history_1)) {
                    history_1.forEach(function (msg) {
                        if (msg.role === "user") {
                            messages_1.push({ role: "user", content: msg.content });
                        }
                        else if (msg.role === "assistant") {
                            messages_1.push({ role: "assistant", content: msg.content });
                        }
                    });
                }
                // Add the current user message
                messages_1.push({ role: "user", content: message });
                return [4 /*yield*/, axios.post("".concat(process.env.OLLAMA_HOST || "http://localhost:11434", "/api/chat"), {
                        model: "qwen2.5:latest",
                        messages: messages_1,
                        options: {
                            temperature: 0.5, // Slightly lower temperature for more consistent responses
                        }
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })];
            case 1:
                ollamaResponse = _b.sent();
                // Format response with additional agent capabilities information
                res.json({
                    message: ollamaResponse.data.message.content,
                    model: "qwen2.5:latest",
                    agent_capabilities: [
                        "Find nearby saloons",
                        "Check service availability",
                        "Provide pricing information",
                        "Suggest appointment times",
                        "Answer service questions",
                        "Provide directions",
                        "Explain policies"
                    ]
                });
                return [3 /*break*/, 3];
            case 2:
                err_20 = _b.sent();
                console.error('AI Chat error:', err_20);
                res.status(500).json({ error: 'Error processing AI request' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Server running on port ".concat(port));
});
