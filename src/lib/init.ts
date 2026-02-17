import pool from './db';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
    console.log('--- Database Initialization Started ---');
    try {
        const schemaPath = path.join(process.cwd(), 'src/lib/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema by semicolon to execute queries one by one
        // Note: This is a simple split, might need more robust parsing if there are semicolons in strings
        const queries = schema
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            try {
                await pool.query(query);
            } catch (err: any) {
                // If it's a "Duplicate key name" or similar index error, we can ignore it since we use CREATE INDEX
                if (err.code === 'ER_DUP_KEYNAME') {
                    continue;
                }
                console.error('Error executing query:', query.substring(0, 50) + '...');
                console.error(err);
            }
        }

        console.log('--- Database Initialization Completed Successfully ---');
        return { success: true };
    } catch (error) {
        console.error('--- Database Initialization Failed ---');
        console.error(error);
        return { success: false, error };
    }
}
