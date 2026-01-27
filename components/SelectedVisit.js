import React from 'react';
import Link from 'next/link';
import styles from '../pages/MobileHome.module.scss';

const SelectedVisit = ({ visit }) => (
  <article className={styles.visitDetailsCard}>
    <div className={styles.addressRow}>
      <b>Contact:</b>{' '}
      <Link
        href={`/contacts/${visit.addresses.contacts.id}`}
        className={styles.contactName}
      >
        {visit.addresses.contacts.name}
      </Link>
    </div>
    <div className={styles.addressRow}>
      <b>Address:</b> {visit.addresses.address}
      <a
        className={styles.gmapsButton}
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.addresses.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions on Google Maps"
      >
        <span role="img" aria-label="Google Maps">🗺️</span> Directions
      </a>
    </div>

    <div><b>Time:</b> {visit.time}</div>

    <div><b>Notes:</b></div>
    <div>
      {visit.notes.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>

    <div><b>Recurrence:</b> {visit.recurrence}</div>
    <div><b>Inside:</b> {visit.isInside ? 'Yes' : 'No'}</div>
  </article>
);

export default SelectedVisit;
