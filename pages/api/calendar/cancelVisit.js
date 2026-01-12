import { deleteCalendarRow } from '../../../lib/calendarService';
import { deleteVisit } from '../../../lib/visitService';

export default async function handler(req, res) {
  const { visitId, visitDate } = req.body;

  try {
    await Promise.all([
      deleteCalendarRow(visitId, visitDate),
      deleteVisit(visitId, visitDate),
    ]);
  } catch (e) {
    return res.status(500).json({ error: 'unable to delete' });
  }

  return res.status(200).json({ success: true });
}
