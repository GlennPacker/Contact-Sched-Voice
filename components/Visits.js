import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useFieldArray, useWatch } from 'react-hook-form';
import styles from './VisitsArrayInput.module.css';

export default function Visits({ nestIndex, control, register, errors, createCalendarInvite }) {
  const { fields, append: add, remove } = useFieldArray({
    control,
    name: `addresses.${nestIndex}.visits`
  });
  const [calendarError, setCalendarError] = useState({});
  const watchedVisits = useWatch({ control, name: `addresses.${nestIndex}.visits` });
  const [collapsed, setCollapsed] = React.useState(fields.map(() => true));
  React.useEffect(() => {
    if (!fields.length) {
      add({ date: '', note: '' });
    }
    if (fields.length === 1) {
      setCollapsed([false]);
    } else {
      setCollapsed(fields.map(() => true));
    }
  }, [fields, add]);
  const toggleCollapse = (idx) => {
    setCollapsed(prev => prev.map((_, i) => i === idx ? false : true));
  };
  const addVisit = () => {
    let newVisit = { date: '' };
    if (fields.length > 0) {
      const sorted = [...fields].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });
      const mostRecent = sorted[0] || {};
      newVisit = {
        date: '',
        note: mostRecent.note || '',
        recurrence: mostRecent.recurrence || 'does not reoccur',
        time: mostRecent.time || '',
        days: mostRecent.days || '',
        isInside: mostRecent.isInside || false
      };
    }
    add(newVisit, { at: 0 });
    setTimeout(() => {
      const arrLen = fields.length + 1;
      setCollapsed(Array.from({ length: arrLen }, (_, i) => i !== 0));
    }, 0);
  };
  return (
    <div className={styles['visits-root']}>
      <div className={styles['visits-caption-row']}>
        <span className={styles['visits-caption']}>Visits</span>
        <Button variant="secondary" size="sm" type="button" onClick={addVisit}>
          Add Visit
        </Button>
      </div>
      <div className={styles['visits-list-scroll']}>
        {fields.map((field, idx) => {
          const watched = watchedVisits?.[idx] || {};
          const calendarUrl = createCalendarInvite && watched.date && watched.time ? createCalendarInvite(watched) : '';
          const showCalendarError = calendarError[idx];
          return (
            <div key={field.id} className={`mb-3 ${styles['visit-fields']}`}>
              <Form.Group className={styles['visit-field-row']}>
                <Form.Label className={styles['visit-label']}>Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register(`addresses.${nestIndex}.visits.${idx}.date`)}
                  className={styles['visit-date']}
                  value={watched.date || ''}
                />
              </Form.Group>
              <Form.Group className={styles['visit-field-row']}>
                <Form.Label className={styles['visit-label']}>Time</Form.Label>
                <Form.Select
                  {...register(`addresses.${nestIndex}.visits.${idx}.time`)}
                  className={styles['visit-time']}
                  value={watched.time || ''}
                >
                  <option value="">Select time</option>
                  <option value="full day">Full day</option>
                  <option value="1/2 day">1/2 day</option>
                  <option value="2 hours">2 hours</option>
                  <option value="multiday">Multiday</option>
                </Form.Select>
              </Form.Group>
              {watched.time === 'multiday' && (
                <Form.Group className={styles['visit-field-row']}>
                  <Form.Label className={styles['visit-label']}>Days</Form.Label>
                  <Form.Control
                    type="text"
                    {...register(`addresses.${nestIndex}.visits.${idx}.days`)}
                    className={styles['visit-days']}
                    value={watched.days || ''}
                  />
                </Form.Group>
              )}
              <Form.Group className={styles['visit-field-row']}>
                <Form.Label className={styles['visit-label']}>Recurrence</Form.Label>
                <Form.Select
                  {...register(`addresses.${nestIndex}.visits.${idx}.recurrence`)}
                  className={styles['visit-recurrence']}
                  value={watched.recurrence || ''}
                >
                  <option value="does not reoccur">Does not reoccur</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="3 weeks">3 weeks</option>
                  <option value="4 weeks (monthly)">4 weeks (monthly)</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className={styles['visit-field-row']}>
                <Form.Label className={styles['visit-label']}>Inside?</Form.Label>
                <Form.Check
                  type="checkbox"
                  {...register(`addresses.${nestIndex}.visits.${idx}.isInside`)}
                  className={styles['visit-isInside']}
                  checked={!!watched.isInside}
                />
              </Form.Group>
              <Form.Control
                as="textarea"
                rows={2}
                {...register(`addresses.${nestIndex}.visits.${idx}.note`)}
                placeholder="Note"
                className={styles['visit-note']}
                value={watched.note || ''}
              />
              <div className={styles['visit-field-row']}>
                <span className={styles['visit-label']}></span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => remove(idx)}
                  tabIndex={-1}
                  aria-label={`Remove visit ${idx + 1}`}
                >
                  Remove
                </Button>
                <a
                  href={calendarUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm ms-2"
                  aria-label="Add to Google Calendar"
                  disabled={!calendarUrl}
                  onClick={e => {
                    if (!calendarUrl) {
                      e.preventDefault();
                      setCalendarError(prev => ({ ...prev, [idx]: true }));
                    } else {
                      setCalendarError(prev => ({ ...prev, [idx]: false }));
                    }
                  }}
                >
                  Add to Google Calendar
                </a>
              </div>
              {showCalendarError && (
                <div style={{ color: 'red', marginLeft: 8, marginTop: 4 }}>
                  {!watched.date && 'Date '}
                  {!watched.time && 'Time '}
                  Are required to create a calendar invite.
                </div>
              )}
            </div>
          );
        })}
      </div>
      {errors?.addresses?.[nestIndex]?.visits && typeof errors.addresses[nestIndex].visits.message === 'string' && (
        <Form.Text className="text-danger">{errors.addresses[nestIndex].visits.message}</Form.Text>
      )}
    </div>
  );
}
