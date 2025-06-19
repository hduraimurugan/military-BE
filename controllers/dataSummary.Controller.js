import { generateDailySummaries } from '../cron/dailySummaryJob.js';

export const handler = async (req, res) => {
    try {
        await generateDailySummaries();
        return res.status(200).json({ message: "Summary job completed" });
    } catch (err) {
        console.error("Cron error:", err);
        return res.status(500).json({ error: "Failed to run summary" });
    }
}
