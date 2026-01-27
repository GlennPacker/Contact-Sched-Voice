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

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const { date, visits } = await fetchMobileHomeVisits();
        console.log('Fetched visits:', visits);
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

  if (loading) return <div className={styles.mobileHomeContainer}><p>Loading visits...</p></div>;
  if (error) return <div className={styles.mobileHomeContainer}><p className={styles.error}>{error}</p></div>;
  if (!cals.length) return <div className={styles.mobileHomeContainer}><p>No visits scheduled.</p></div>;

  return (
    <div className={styles.mobileHomeContainer}>
      <h2>{isToday ? "Today's visits" : visitDate}</h2>
      <ul className={styles.visitsList}>
        {cals.map(({ visits: visit }) => (
          <li key={visit.id} className={styles.visitListItem}>
            <strong>{visit.addresses.contacts.name}</strong> - {visit.time}
          </li>
        ))}
      </ul>
      <section className={styles.visitDetails}>
        <h3>Visit Details</h3>
        {cals.map(({ visits: visit }) => (
          <div key={visit.id}>
            <SelectedVisit key={visit.id} visit={visit} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default MobileHome;
