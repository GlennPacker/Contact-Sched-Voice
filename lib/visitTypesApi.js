export async function getVisitTypes() {
  try {
    const res = await fetch('/api/visitTypes', { headers: { Accept: 'application/json' } });
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error('Failed to fetch visit types');
  }
}
