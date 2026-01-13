
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { cancelVisitApi, cancelFutureVisitsApi } from '../../lib/visitService';
import MoveVisit from './MoveVisit';

export default function CalendarToastToolbar({ visit, contactId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function makeApiCall(apiFn) {
    setError(null);
    setLoading(true);
    try {
      await apiFn(visit.id, visit.visitDate);
      router.reload();
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ paddingLeft: '1rem' }}>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger me-2"
          onClick={() => makeApiCall(cancelVisitApi)}
          disabled={loading}
          aria-label="Cancel visit"
        >
          🗑 Cancel
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-danger me-2"
          onClick={() => makeApiCall(cancelFutureVisitsApi)}
          disabled={loading}
          aria-label="Delete all future visits"
        >
          🗑📅 Delete future
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-2"
          disabled={loading}
          onClick={() => router.push(`/contacts/${contactId}/edit`)}
        >
          Edit
        </button>

        <MoveVisit
          visit={visit}
          loading={loading}
        />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </>
  );
}
