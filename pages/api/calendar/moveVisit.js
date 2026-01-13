
import { updateCalendarDate, updateFutureCalendarDates } from '../../../lib/calendarService';
import { updateVisitTableDate } from '../../../lib/visitService';

export default async function handler(req, res) {
  try {
    const { calendarId, visitId, newDate, moveFuture, originalDate } = req.body;
    const promises = [updateVisitTableDate(visitId, originalDate, newDate)];

    if (!moveFuture) {
      promises.push(updateCalendarDate(calendarId, newDate));
    } else {
      const oldDate = new Date(originalDate);
      const newD = new Date(newDate);
      const daysDiff = Math.round((newD - oldDate) / (1000 * 60 * 60 * 24));
      promises.push(updateFutureCalendarDates(visitId, daysDiff, originalDate));
    }

    await Promise.all(promises);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
