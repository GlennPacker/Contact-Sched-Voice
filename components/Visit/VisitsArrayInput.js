export { default } from './VisitsArrayInput.jsx';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useFieldArray } from 'react-hook-form';
import styles from './VisitsArrayInput.module.css';


export default function VisitsArrayInput({ nestIndex, control, register, errors }) {
  const { fields, append: add, remove } = useFieldArray({
    control,
    name: `addresses.${nestIndex}.visits`
  });

  const [timeValues, setTimeValues] = React.useState(fields.map(f => f.time || ''));
  const [collapsed, setCollapsed] = React.useState(fields.map(() => false));

  React.useEffect(() => {
    if (!fields.length) {
      add({ date: '', note: '' });
    }
    setTimeValues(fields.map(f => f.time || ''));
    setCollapsed(fields.map(() => false));
  }, [fields, add]);

  const handleTimeChange = (idx, e) => {
    const newValues = [...timeValues];
    newValues[idx] = e.target.value;
    setTimeValues(newValues);
  };

  const handleCollapseToggle = (idx) => {
    setCollapsed(prev => prev.map((val, i) => i === idx ? !val : true));
  };

  const handleAddVisit = () => {
    let note = '';
    if (fields.length > 0) {
      const sorted = [...fields].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });
      note = sorted[0]?.note || '';
    }
    add({ date: '', note });
    setTimeout(() => {
      setCollapsed(Array(fields.length + 1).fill(true).map((v, i, arr) => i === arr.length - 1 ? false : true));
    }, 0);
  };

  return (
    <div>
      <div className={styles['visits-caption-row']}>
        <span className={styles['visits-caption']}>Visits</span>
        <Button variant="secondary" size="sm" type="button" onClick={handleAddVisit}>
          Add Visit
        </Button>
      </div>
      <div className={styles['visits-list-scroll']}>
        {fields.map((field, idx) => {
          const time = timeValues[idx] || '';
          const isCollapsed = collapsed[idx];
          return (
            <div key={field.id} className={`mb-3 ${styles['visit-fields']}`}>
              {isCollapsed ? (
                <div className={styles['visit-collapsed-summary']}>
                  <span
                    className={`${styles['visit-collapsed-date']} ${styles['visit-cursor-pointer']}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCollapseToggle(idx)}
                    onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleCollapseToggle(idx) }}
                    aria-label="Expand visit details"
                  >
                    {field.date || 'No date'}
                  </span>
                  {field.recurrence && field.recurrence !== 'does not reoccur' && (
                    <span className={styles['visit-collapsed-recurrence']}>
                      {field.recurrence}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles['visit-fields-col']}>
                    <div className={styles['visit-field-row']}>
                      <Form.Label
                        className={`${styles['visit-label']} ${styles['visit-cursor-pointer']}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCollapseToggle(idx)}
                        onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleCollapseToggle(idx) }}
                        aria-label={isCollapsed ? 'Expand visit' : 'Collapse visit'}
                      >
                        Date *
                      </Form.Label>
                      <Form.Control
                        type="date"
                        {...register(`addresses.${nestIndex}.visits.${idx}.date`, { required: 'Date is required' })}
                        placeholder="Visit date"
                        className={styles['visit-date']}
                      />
                    </div>
                    <div className={styles['visit-field-row']}>
                      <Form.Label className={styles['visit-label']}>Recurrence</Form.Label>
                      <Form.Select
                        {...register(`addresses.${nestIndex}.visits.${idx}.recurrence`)}
                        className={styles['visit-select']}
                        defaultValue="does not reoccur"
                      >
                        <option value="does not reoccur">does not reoccur</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="3 weeks">3 weeks</option>
                        <option value="monthly (4 weeks)">monthly (4 weeks)</option>
                      </Form.Select>
                    </div>
                    <div className={styles['visit-field-row']}>
                      <Form.Label className={styles['visit-label']}>Time *</Form.Label>
                      <Form.Select
                        {...register(`addresses.${nestIndex}.visits.${idx}.time`, { required: 'Time is required' })}
                        className={styles['visit-select']}
                        defaultValue=""
                        value={time}
                        onChange={e => handleTimeChange(idx, e)}
                      >
                        <option value="" disabled>Time</option>
                        <option value="2 hours">2 hours</option>
                        <option value="1/2 day">1/2 day</option>
                        <option value="full day">full day</option>
                        <option value="multiday">multiday</option>
                      </Form.Select>
                    </div>
                    {time === 'multiday' && (
                      <div className={styles['visit-field-row']}>
                        <Form.Label className={styles['visit-label']}>Days *</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          {...register(`addresses.${nestIndex}.visits.${idx}.days`, { valueAsNumber: true, min: { value: 1, message: 'Must be at least 1' } })}
                          placeholder="Days"
                          className={styles['visit-days']}
                        />
                      </div>
                    )}
                    <div className={styles['visit-field-row']}>
                      <Form.Label className={styles['visit-label']}>Inside</Form.Label>
                      <Form.Check
                        type="checkbox"
                        label=""
                        {...register(`addresses.${nestIndex}.visits.${idx}.isInside`)}
                      />
                    </div>
                    {fields.length > 1 && (
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
                      </div>
                    )}
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    {...register(`addresses.${nestIndex}.visits.${idx}.note`)}
                    placeholder="Note"
                    className={styles['visit-note']}
                  />
                </>
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
