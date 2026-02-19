
import CalendarToastToolbar from '../CalendarToastToolbar/CalendarToastToolbar';
import React, { useEffect, useState } from 'react';
import styles from './CalendarToast.module.scss';
import { getVisitTypes } from '../../lib/visitTypesApi';

export default function CalendarToast({ onClose, data }) {
  if (!data) return null;

  const { contact, address, visit, futureVisits } = data;

  const [visitTypeName, setVisitTypeName] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchType() {
      if (visit?.visitTypeId) {
        try {
          const types = await getVisitTypes();
          const found = types.find(t => t.id === visit.visitTypeId);
          setVisitTypeName(found?.name || '');
        } catch {
          setError('Failed to fetch visit types');
        }
      } else {
        setVisitTypeName('');
      }
    }
    fetchType();
  }, [visit?.visitTypeId]);

  return (
    <div
      className={styles.toastWrapper}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.toastHeader}
      >
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
        data={data}
        onMoveComplete={onClose}
      />

      <div
        className={styles.toastBody}
      >
        <div className={styles.bodyTable}>
          <div className={styles.leftCol}>
            <div className={styles.row}><strong>Date:</strong> {visit.visitDate}</div>
            <div className={styles.row}><strong>Tooling:</strong> {visitTypeName}</div>
            <div className={styles.row}><strong>Time:</strong> {visit.time}</div>
            <div className={styles.row}><strong>Recurrence:</strong> {visit.recurrence}</div>
            <div className={styles.row}><strong>Notes:</strong></div>
            <div className={styles.notes}>{visit.notes}</div>
          </div>
          <div className={styles.middleCol}>
            <div className={styles.row}><strong>Rates:</strong></div>
            <div className={styles.ratesList}>
              <div><strong>Full day:</strong> €{contact.rateFullDay}</div>
              <div><strong>Half day:</strong> €{contact.rateHalfDay}</div>
              <div><strong>2 hour:</strong> €{contact.rateTwoHour}</div>
              <div><strong>Hour:</strong> €{contact.rateHour}</div>
              <div><strong>Job:</strong> €{contact.rateJob}</div>
            </div>
          </div>
          <div className={styles.rightCol}>
            <strong>Upcoming visits</strong>
            <div className={styles.upcomingList}>
              {futureVisits?.length ? (
                futureVisits.map((d, i) => (
                  <div
                    key={i}
                    className={styles.upcomingItem}
                  >
                    {d}
                  </div>
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
