import React from 'react';
import styles from './CalendarToast.module.scss';
import { useRouter } from 'next/router';

export default function CalendarToast({ onClose, data }) {
  if (!data) return null;

  const { contact, address, visit, futureVisits } = data;
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/contacts/${contact.id}/edit`);
  };

  return (
    <div className={styles.toastWrapper} role="dialog" aria-modal="true">
      <div className={styles.toastHeader}>
        <div>
          <strong>{contact.name}</strong>
          <div className={styles.sub}>{address.address}</div>
        </div>
        <div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={handleEdit}>
          Edit
        </button>
      </div>

      <div className={styles.toastBody}>
        <div className={styles.bodyTable}>
          <div className={styles.leftCol}>
            <div className={styles.row}><strong>Date:</strong> {visit.visitDate}</div>
            <div className={styles.row}><strong>Time:</strong> {visit.time}</div>
            <div className={styles.row}><strong>Recurrence:</strong> {visit.recurrence}</div>
            <div className={styles.row}><strong>Notes:</strong></div>
            <div className={styles.notes}>{visit.notes}</div>
          </div>
          <div className={styles.rightCol}>
            <strong>Upcoming visits</strong>
            <div className={styles.upcomingList}>
              {futureVisits?.length ? (
                futureVisitsmap((d, i) => (
                  <div key={i} className={styles.upcomingItem}>{d}</div>
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
