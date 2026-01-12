import React from 'react';
import { useRouter } from 'next/router';
import styles from './CalendarToast.module.scss';

export default function CalendarToast({ show, onClose, data }) {
  if (!show || !data) return null;

  const { contact, address, visit, futureVisits } = data;
  const router = useRouter();

  const handleEdit = () => {
    if (contact && contact.id) {
      onClose && onClose();
      router.push(`/contacts/${contact.id}/edit`);
    }
  };

  return (
    <div className={styles.toastWrapper} role="dialog" aria-modal="true">
      <div className={styles.toastHeader}>
        <div>
          <strong>{(contact && contact.name) || 'Unknown contact'}</strong>
          <div className={styles.sub}>{(address && address.address) || ''}</div>
        </div>
        <div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={handleEdit}>
          Edit
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => { }}>
          Action
        </button>
      </div>

      <div className={styles.toastBody}>
        <div className={styles.bodyTable}>
          <div className={styles.leftCol}>
            <div className={styles.row}><strong>Date:</strong> {visit.visitDate}</div>
            <div className={styles.row}><strong>Time:</strong> {visit.time}</div>
            <div className={styles.row}><strong>Recurrence:</strong> {visit.recurrence}</div>
            <div className={styles.row}><strong>Notes:</strong></div>
            <div className={styles.notes}>{visit.notes || ''}</div>
          </div>
          <div className={styles.rightCol}>
            <strong>Upcoming visits</strong>
            <div className={styles.upcomingList}>
              {futureVisits && futureVisits.length ? (
                futureVisits.map((d, i) => (
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
