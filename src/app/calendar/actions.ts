"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function getCalendarEvents(month: number, year: number) {
    try {
        // Fetch all ads with an event_datetime in the specified month
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, title, type, event_datetime, city 
       FROM ads 
       WHERE is_active = 1 AND is_deleted = 0 
       AND MONTH(event_datetime) = ? AND YEAR(event_datetime) = ?`,
            [month, year]
        );
        return rows;
    } catch (error) {
        console.error("Fetch calendar events error:", error);
        return [];
    }
}
