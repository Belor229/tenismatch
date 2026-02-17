import pool from './db';

export async function runAutomationTasks() {
    console.log('--- Running Backend Automation Tasks ---');
    const results = {
        expiredAds: 0,
        abandonedConvs: 0,
    };

    try {
        // 1. Deactivate ads whose event_datetime has passed
        const [adResult]: any = await pool.query(
            'UPDATE ads SET is_active = 0 WHERE event_datetime < NOW() AND is_active = 1'
        );
        results.expiredAds = adResult.affectedRows;

        // 2. Mark conversations with no messages for 30 days as archived (hypothetical)
        const [convResult]: any = await pool.query(
            `UPDATE conversation_participants cp
       JOIN conversations c ON cp.conversation_id = c.id
       SET cp.is_archived = 1
       WHERE c.last_message_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND cp.is_archived = 0`
        );
        results.abandonedConvs = convResult.affectedRows;

        console.log(`Automation completed: ${results.expiredAds} ads expired, ${results.abandonedConvs} conversations archived.`);
        return { success: true, results };
    } catch (error) {
        console.error('Automation failed:', error);
        return { success: false, error };
    }
}
