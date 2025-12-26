import React from 'react';
import { Button, Form } from 'react-bootstrap';

export default function Visit({
  field,
  idx,
  nestIndex,
  watched,
  collapsed,
  toggleCollapse,
  remove,
  register,
  createCalendarInvite,
  calendarError,
  setCalendarError,
  collapseAll,
  minDateStr,
  styles,
}) {
  const calendarUrl = createCalendarInvite && watched.date && watched.time ? createCalendarInvite(watched) : '';
  const showCalendarError = calendarError[idx];

  return (
    <div key={field.id} className={`mb-3 ${styles['visit-fields']}`}>
      {collapsed ? (
        <div className={styles['visit-collapsed-summary']}>
          <div>
            <span className={styles['visit-collapsed-date']}>{watched.date || 'No date'}</span>
            <span className={styles['visit-collapsed-recurrence']}> {watched.recurrence ? `· ${watched.recurrence}` : ''}</span>
            <div style={{ fontSize: '0.9rem', color: '#444' }}>{watched.note ? watched.note.substring(0, 80) : ''}</div>
          </div>
          <div>
            <Button variant="outline-secondary" size="sm" onClick={() => toggleCollapse(idx)} tabIndex={-1} className="me-2">Open</Button>
            <Button variant="danger" size="sm" onClick={() => remove(idx)} tabIndex={-1} aria-label={`Remove visit ${idx + 1}`}>Remove</Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles['visit-fields-col']}>
            <Form.Group className={styles['visit-field-row']}>
              <Form.Label className={styles['visit-label']}>Date</Form.Label>
              <Form.Control
                type="date"
                {...register(`addresses.${nestIndex}.visits.${idx}.date`)}
                className={styles['visit-date']}
                value={watched.date || ''}
                min={minDateStr}
              />
            </Form.Group>
            <Form.Group className={styles['visit-field-row']}>
              <Form.Label className={styles['visit-label']}>Flexible Dates</Form.Label>
              <Form.Check
                type="checkbox"
                {...register(`addresses.${nestIndex}.visits.${idx}.isFlexilbe`)}
                className={styles['visit-isFlexible']}
                checked={!!watched.isFlexilbe}
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
                variant="outline-secondary"
                size="sm"
                onClick={collapseAll}
                tabIndex={-1}
                className="me-2"
              >
                Collapse
              </Button>
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
        </>
      )}
    </div>
  );
}
