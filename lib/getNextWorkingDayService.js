export async function fetchMobileHomeVisits() {
  const res = await fetch('/api/getNextWorkingDay');
  if (!res.ok) throw new Error('Failed to fetch visit data');
  return await res.json();
}
