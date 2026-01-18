import React, { useState } from 'react';
import { cancelFutureVisitsApi, cancelVisitApi } from '../../lib/visitService';

import MoveVisit from '../MoveVisit/MoveVisit';
import { VisitTime } from '../../lib/referenceDataService';
import { loadInvoiceData } from '../../lib/invoiceLoaderService';
import { useRouter } from 'next/router';

export default function CalendarToastToolbar({ data, onMoveComplete }) {
  const { visit, contact } = data || {};
  const contactId = contact?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const makeApiCall = async apiFn => {
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
  };

  return (
    <>
      <div style={{ paddingLeft: '1rem' }}>
        <button
          type="button"
          className="btn btn-sm btn-outline-success me-2"
          onClick={() => loadInvoiceData(data)}
          aria-label="Load invoice data"
        >
          📄 Load invoice data
        </button>
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
          📅 Delete future
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
          onMoveComplete={onMoveComplete}
        />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </>
  );
}


