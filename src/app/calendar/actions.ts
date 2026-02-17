"use server";

import { supabase } from "@/lib/supabase";

export async function getCalendarEvents(month: number, year: number) {
    try {
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

        const { data, error } = await supabase
            .from('ads')
            .select('id, title, type, event_datetime, city')
            .eq('is_active', true)
            .eq('is_deleted', false)
            .gte('event_datetime', startDate)
            .lte('event_datetime', endDate);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch calendar events error:", error);
        return [];
    }
}
