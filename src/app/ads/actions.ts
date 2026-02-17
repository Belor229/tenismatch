"use server";

import pool from "@/lib/db";
import { initializeDatabase } from "@/lib/init";
import { AdType, UserLevel } from "@/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import { MOCK_ADS } from "@/lib/mockData";

export async function createAd(formData: any) {
  const { userId, type, title, description, city, location, eventDatetime, requiredLevel } = formData;

  if (!userId || !type || !title || !description || !city) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ads (user_id, type, title, description, city, location, event_datetime, required_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, title, description, city, location || null, eventDatetime || null, requiredLevel || null]
    );

    revalidatePath("/");
    revalidatePath("/ads");

    return { success: true, adId: result.insertId };
  } catch (error: any) {
    console.error("Create ad error:", error);
    return { error: "Une erreur est survenue lors de la création de l'annonce." };
  }
}

export async function getAds(filters: any = {}) {
  // Ensure DB is initialized (will only run effectively once)
  await initializeDatabase();

  const { type, city, level } = filters;
  let query = "SELECT a.*, p.display_name, p.avatar_url FROM ads a JOIN user_profiles p ON a.user_id = p.user_id WHERE a.is_active = 1 AND a.is_deleted = 0";
  const params: any[] = [];

  if (type) {
    query += " AND a.type = ?";
    params.push(type);
  }
  if (city) {
    query += " AND a.city LIKE ?";
    params.push(`%${city}%`);
  }
  if (level) {
    query += " AND a.required_level = ?";
    params.push(level);
  }

  query += " ORDER BY a.created_at DESC";

  try {
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows.length > 0 ? rows : MOCK_ADS;
  } catch (error) {
    console.error("Fetch ads error (falling back to mocks):", error);
    return MOCK_ADS;
  }
}

export async function getAdById(id: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT a.*, p.display_name, p.avatar_url, p.level as user_level, u.phone FROM ads a JOIN user_profiles p ON a.user_id = p.user_id JOIN users u ON a.user_id = u.id WHERE a.id = ?",
      [id]
    );

    if (rows.length === 0) {
      return MOCK_ADS.find(a => a.id.toString() === id.toString()) || null;
    }
    return rows[0];
  } catch (error) {
    console.error("Fetch ad detail error (falling back to mocks):", error);
    const mock = MOCK_ADS.find(a => a.id.toString() === id.toString());
    return mock || null;
  }
}
