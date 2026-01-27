import React from 'react';
import styles from '../pages/MobileHome.module.scss';

const SelectedVisit = ({ visit }) => (
  <article className={styles.visitDetailsCard}>
    <div><b>Time:</b> {visit.time}</div>
    {visit.notes && (
      <div><b>Note:</b> {visit.notes.split('\n').map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
      ))}</div>
    )}
    <div className={styles.addressRow}>
      <b>Address:</b> {visit.addresses?.address}
      <a
        className={styles.gmapsButton}
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.addresses?.address || '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions on Google Maps"
      >
        <span role="img" aria-label="Google Maps">🗺️</span> Directions
      </a>
    </div>
    <div className={styles.addressRow}>
      <b>Contact:</b> {visit.addresses?.contacts?.[0]?.name}
    </div>
    <div><b>Recurrence:</b> {visit.recurrence}</div>
    {visit.days && (
      <div><b>Days:</b> {Array.isArray(visit.days) ? visit.days.join(', ') : visit.days}</div>
    )}
    <div><b>Inside:</b> {visit.isInside ? 'Yes' : 'No'}</div>
  </article>
);

export default SelectedVisit;
