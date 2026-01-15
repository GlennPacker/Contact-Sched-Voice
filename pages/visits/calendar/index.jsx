import 'react-big-calendar/lib/css/react-big-calendar.css';

import CalendarView from '../../../components/CalendarView/CalendarView';
import CalendarKey from '../../../components/CalendarKey/CalendarKey';
import Weather from '../../../components/Weather/Weather';
import { getCalendarEventsSSR } from '../../../lib/calendarServerService';
import styles from './Calendar.module.scss';

export default function VisitsCalendarPage(props) {
  return (
    <div className={styles.gridLayout}>
      <div className={styles.gridCalendar}>
        <CalendarView {...props} />
      </div>
      <div className={styles.gridKey}>
        <CalendarKey />
        <div style={{ marginTop: 32 }}>
          <Weather events={props.events || []} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const { month } = context.params || {};
    const events = await getCalendarEventsSSR({ month });
    return { props: { events } };
  } catch (err) {
    return { props: { events: [], error: err?.message || 'Server error' } };
  }
}
