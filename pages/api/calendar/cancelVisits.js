import { getById, deleteById as deleteVisitsById } from '../../../lib/visitService';
import { listFutureById } from '../../../lib/addressService';
import { deleteById as deleteCalendarById } from '../../../lib/calendarService';

export default async function handler(req, res) {
  const { visitId, fromDate } = req.body;

  try {
    const visitRow = await getById(visitId);
    const visits = await listFutureById(visitRow.addressId, fromDate);
    const visitIds = visits.map(v => v.id);

    await deleteCalendarById(visitIds);
    await deleteVisitsById(visitIds);

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err ? err.message : 'Failed to cancel visits' });
  }
}
