import { Button, Form } from 'react-bootstrap';
import React, { forwardRef } from 'react';
import { VisitTime } from '../../lib/referenceDataService';

const Visit = forwardRef(function Visit({
  field,
  idx,
  nestIndex,
  watched = {},
  collapsed,
  toggleCollapse,
  remove,
  register,
  createCalendarInvite,
  calendarError = {},
  setCalendarError,
  collapseAll,
  minDateStr,
  styles = {},
}, ref) {
  const calendarUrl = watched.visitDate && watched.time ? (createCalendarInvite?.(watched) || '') : '';
  const showCalendarError = calendarError && calendarError[idx];

  if (collapsed) {
    return (
      <div
        className={`mb-3 ${styles['visit-fields']}`}
        key={field.id}>
        <div
          className={`${styles['visit-collapsed-summary']} ${styles['visit-cursor-pointer']}`}
          onClick={() => toggleCollapse(idx)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleCollapse(idx);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div>
            <span className={styles['visit-collapsed-date']}>{watched.visitDate || 'No date'}</span>
            <span className={styles['visit-collapsed-recurrence']}>{watched.recurrence}</span>
            <div className={styles['visit-summary-text']}>{watched.notes ? watched.notes.substring(0, 80) : ''}</div>
          </div>
          <div>
            <Button
              variant="danger"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                remove(idx);
              }}
              tabIndex={-1}
              aria-label={`Remove visit ${idx + 1}`}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-3 ${styles['visit-fields']}`}
      key={field.id}
      ref={ref}>
      <div className={styles['visit-fields-col']}>
        <Form.Group className={styles['visit-field-row']}>
          <Form.Label
            className={`${styles['visit-label']} ${styles['visit-cursor-pointer']}`}
            onClick={collapseAll}
            role="button"
            tabIndex={0}
          >
            Date
          </Form.Label>
          <Form.Control
            type="date"
            {...register(`addresses.${nestIndex}.visits.${idx}.visitDate`)}
            className={styles['visit-date']}
            defaultValue={watched.visitDate || ''}
            min={minDateStr}
          />
        </Form.Group>

        <Form.Group className={styles['visit-field-row']}>
          <Form.Label className={styles['visit-label']}>Flexible Dates</Form.Label>
          <Form.Check
            type="checkbox"
            {...register(`addresses.${nestIndex}.visits.${idx}.isFlexilbe`)}
            className={styles['visit-isFlexible']}
            defaultChecked={!!watched.isFlexilbe}
          />
        </Form.Group>

        <Form.Group className={styles['visit-field-row']}>
          <Form.Label className={styles['visit-label']}>Time</Form.Label>
          <Form.Select
            {...register(`addresses.${nestIndex}.visits.${idx}.time`)}
            className={styles['visit-time']}
            defaultValue={watched.time || ''}
          >
            <option value="">Select time</option>
            <option value={VisitTime.FULL_DAY}>Full day</option>
            <option value={VisitTime.HALF_DAY}>1/2 day</option>
            <option value={VisitTime.TWO_HOUR}>2 hours</option>
            <option value={VisitTime.MULTIDAY}>Multiday</option>
          </Form.Select>
        </Form.Group>

        {watched.time === 'multiday' && (
          <Form.Group className={styles['visit-field-row']}>
            <Form.Label className={styles['visit-label']}>Days</Form.Label>
            <Form.Control
              type="text"
              {...register(`addresses.${nestIndex}.visits.${idx}.days`)}
              className={styles['visit-days']}
              defaultValue={watched.days || ''}
            />
          </Form.Group>
        )}

        <Form.Group className={styles['visit-field-row']}>
          <Form.Label className={styles['visit-label']}>Recurrence</Form.Label>
          <Form.Select
            {...register(`addresses.${nestIndex}.visits.${idx}.recurrence`)}
            className={styles['visit-recurrence']}
            defaultValue={watched.recurrence || ''}
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
            defaultChecked={!!watched.isInside}
          />
        </Form.Group>

        <Form.Control
          as="textarea"
          rows={5}
          {...register(`addresses.${nestIndex}.visits.${idx}.notes`)}
          placeholder="Note"
          className={styles['visit-note']}
          defaultValue={watched.notes || ''}
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
          <div className={styles['calendar-error']}>
            {!watched.visitDate && 'Date '}
            {!watched.time && 'Time '}
            Are required to create a calendar invite.
          </div>
        )}
      </div>
    </div>
  );
});

export default Visit;
