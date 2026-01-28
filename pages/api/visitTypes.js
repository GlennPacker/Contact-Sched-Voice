import { getVisitTypes } from '../../lib/visitTypesService';

export default async function handler(req, res) {
  try {
    const data = await getVisitTypes();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
