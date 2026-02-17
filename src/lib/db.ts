import mysql from 'mysql2/promise';
import { initializeDatabase } from './init';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tennis_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Initialize database once when the module is loaded
if (process.env.NODE_ENV !== 'production' || true) {
    initializeDatabase().then(() => {
        console.log('Database auto-initialization check completed');
    }).catch(err => {
        console.error('Database auto-initialization failed:', err);
    });
}

export default pool;
