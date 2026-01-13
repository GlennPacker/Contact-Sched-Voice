
import React from 'react';
import styles from './CalendarToast.module.scss';
import CalendarToastToolbar from '../CalendarToastToolbar/CalendarToastToolbar';

export default function CalendarToast({ onClose, data }) {
  if (!data) return null;

  const { contact, address, visit, futureVisits } = data;

  return (
    <div
      className={styles.toastWrapper}
      role="dialog"
      aria-modal="true"
    >
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

      <CalendarToastToolbar
        visit={visit}
        contactId={contact.id}
      />

      <div
        className={styles.toastBody}
      >
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
