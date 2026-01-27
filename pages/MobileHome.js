import React, { useState, useEffect } from 'react';
import styles from './MobileHome.module.scss';
import { fetchMobileHomeVisits } from '../lib/getNextWorkingDayService';
import SelectedVisit from '../components/SelectedVisit';

const MobileHome = () => {
  const [cals, setCals] = useState([]);
  const [visitDate, setVisitDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isToday, setIsToday] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const { date, visits } = await fetchMobileHomeVisits();
        setCals(visits);
        setVisitDate(date);
        setIsToday(date === new Date().toISOString().slice(0, 10));
      } catch {
        setError('Error loading visits');
        setCals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  useEffect(() => {
    if (cals.length) setSelectedVisit(cals[0].visits);
  }, [cals]);

  if (loading) return <div className={styles.mobileHomeContainer}><p>Loading visits...</p></div>;
  if (error) return <div className={styles.mobileHomeContainer}><p className={styles.error}>{error}</p></div>;
  if (!cals.length) return <div className={styles.mobileHomeContainer}><p>No visits scheduled.</p></div>;

  const select = (visit) => setSelectedVisit(visit);

  return (
    <div className={styles.mobileHomeContainer}>
      <h2>{isToday ? "Today's visits" : visitDate}</h2>
      {cals.length > 1 &&
        <ul className={styles.visitsList}>
          {cals.map(({ visits: visit }) => (
            <li
              key={visit.id}
              className={[
                styles.visitListItem,
                selectedVisit && visit.id === selectedVisit.id ? styles.selected : '',
                'clickable'
              ].filter(x => x).join(' ')}
              onClick={() => select(visit)}
            >
              <strong>{visit.addresses.contacts.name}</strong> - {visit.time}
            </li>
          ))}
        </ul>
      }
      <section className={styles.visitDetails}>
        <h3>Visit Details</h3>
        {selectedVisit && <SelectedVisit visit={selectedVisit} />}
      </section>
    </div>
  );
};

export default MobileHome;
