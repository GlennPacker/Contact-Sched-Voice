import { listAllByVisitId } from '../../../lib/calendarService';

export default async function handler(req, res) {
  try {
    const { visitId, visitDate } = req.body;
    const rows = await listAllByVisitId(visitId, visitDate);
    return res.status(200).json({ exists: !!rows.length });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to check future dates' });
  }
}
