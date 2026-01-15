import React from 'react';
import styles from './CalendarKey.module.scss';

const keyItems = [
  { color: '#2ecc40', description: 'Inside' },
  { color: '#0074d9', description: 'Outside' },
  { color: '#444', description: '2 hours' },
  { color: '#FF9800', description: 'Half Day' },
  { color: '#9C27B0', description: 'Full Day' },
  { color: '#FFEB3B', description: 'Personal/Away' },
];

const CalendarKey = () => (
  <div className={styles.calendarKey}>
    <div className={styles.keyRow}>
      {keyItems.slice(0, 2).map((item, idx) => (
        <div key={idx} className={styles.keyItem}>
          <span
            className={styles.colorSwatch}
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${item.color}`,
            }}
          />
          <span className={styles.description}>{item.description}</span>
        </div>
      ))}
      <div style={{ height: '1.5rem' }} />
      {keyItems.slice(2).map((item, idx) => (
        <div
          key={idx + 2}
          className={styles.keyItem}>
          <span
            className={styles.colorSwatch}
            style={{
              backgroundColor: item.color,
              border: 'none',
            }}
          />
          <span className={styles.description}>{item.description}</span>
        </div>
      ))}
    </div>
  </div>
);

export default CalendarKey;
