import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarView, { getServerSideProps } from '../../../components/CalendarView/CalendarView';
import CalendarKey from '../../../components/CalendarKey/CalendarKey';


import styles from './Calendar.module.scss';

export default function VisitsCalendarPage(props) {
  return (
    <div className={styles.gridLayout}>
      <div className={styles.gridCalendar}>
        <CalendarView {...props} />
      </div>
      <div className={styles.gridKey}>
        <CalendarKey />
      </div>
    </div>
  );
}

export { getServerSideProps };
