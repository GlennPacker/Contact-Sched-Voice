import React from 'react';
import styles from './CalendarKey.module.scss';

// Example key data. You can update or pass this as props.
const keyItems = [
  { color: '#2ecc40', description: 'Inside (green border)' },
  { color: '#0074d9', description: 'Outside (blue border)' },
  { color: '#444', description: '2 hours (background)' },
  { color: '#FF9800', description: 'Half Day (background)' },
  { color: '#9C27B0', description: 'Full Day (background)' },
  { color: '#FFEB3B', description: 'Personal/Away (background)' },
];

const CalendarKey = () => (
  <div className={styles.calendarKey}>
    <h4>Visit Colour Key</h4>
    <div className={styles.keyRow}>
      {keyItems.map((item, idx) => (
        <div key={idx} className={styles.keyItem}>
          <span
            className={styles.colorSwatch}
            style={{
              backgroundColor: ['#444', '#2196F3', '#FF9800', '#9C27B0', '#FFEB3B'].includes(item.color) ? item.color : 'transparent',
              border: ['#2ecc40', '#0074d9'].includes(item.color) ? `2px solid ${item.color}` : 'none',
            }}
          />
          <span className={styles.description}>{item.description}</span>
        </div>
      ))}
    </div>
  </div>
);

export default CalendarKey;
