import React, { useState } from 'react';
import styles from './CalendarToast.module.scss';
import { useRouter } from 'next/router';

export default function CalendarToast({ onClose, data }) {
  if (!data) return null;

  const { contact, address, visit, futureVisits } = data;
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const edit = () => {
    router.push(`/contacts/${contact.id}/edit`);
  };

  const cancel = async () => {
    if (!visit?.id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/cancelVisit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId: visit.id, visitDate: visit.visitDate }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error || 'Failed to cancel visit');
        setLoading(false);
        return;
      }
      router.reload();
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.toastWrapper}
      role="dialog"
      aria-modal="true">

      <div className={styles.toastHeader}>
        <strong>{contact.name}</strong>
        <div className={styles.sub}>{address.address}</div>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className={styles.toolbar}>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger me-2"
          onClick={cancel}
          disabled={loading}
          aria-label="Cancel visit">
          🗑 Cancel
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-2"
          onClick={edit}>
          Edit
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.toastBody}>
        <div className={styles.bodyTable}>
          <div className={styles.leftCol}>
            <div className={styles.row}>
              <strong>Date:</strong> {visit.visitDate}
            </div>
            <div className={styles.row}>
              <strong>Time:</strong> {visit.time}
            </div>
            <div className={styles.row}><strong>Recurrence:</strong> {visit.recurrence}</div>
            <div className={styles.row}><strong>Notes:</strong></div>
            <div className={styles.notes}>{visit.notes}</div>
          </div>
          <div className={styles.rightCol}>
            <strong>Upcoming visits</strong>
            <div className={styles.upcomingList}>
              {futureVisits?.length ? (
                futureVisits.map((d, i) => (
                  <div
                    key={i}
                    className={styles.upcomingItem}>{d}</div>
                ))
              ) : (
                <div className={styles.upcomingEmpty}>No upcoming visits</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
