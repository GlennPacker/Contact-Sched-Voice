import React from 'react';
import styles from './CalendarKey.module.scss';

// Example key data. You can update or pass this as props.
const keyItems = [
  { color: '#444', description: '2 hours' },
  { color: '#2196F3', description: 'Outside' },
  { color: '#FF9800', description: 'Half Day' },
  { color: '#9C27B0', description: 'Full Day' },
  { color: '#FFEB3B', description: 'Personal/Away' },
];

const CalendarKey = () => (
  <div className={styles.calendarKey}>
    <h4>Visit Colour Key</h4>
    <div className={styles.keyRow}>
      {keyItems.map((item, idx) => (
        <div key={idx} className={styles.keyItem}>
          <span
            className={styles.colorSwatch}
            style={{ backgroundColor: item.color }}
          />
          <span className={styles.description}>{item.description}</span>
        </div>
      ))}
    </div>
  </div>
);

export default CalendarKey;
