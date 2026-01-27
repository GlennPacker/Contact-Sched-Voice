import { getNextVisitsDayWithVisits } from '../../lib/calendarService';

export default async function handler(req, res) {
  try {
    const { date, visits } = await getNextVisitsDayWithVisits();
    res.status(200).json({ date, visits });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load visits' });
  }
}
