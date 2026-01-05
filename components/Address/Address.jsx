import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useWatch } from 'react-hook-form';
import Visits from '../Visit/Visits.jsx';
import styles from './Address.module.scss';

export default function Address({ field, idx, register, errors, removeAddress, totalAddresses, contactName, control, onCalendarInvite, isSelected, onSelect }) {
  const watchedAddresses = useWatch({ control, name: 'addresses' });
  const address = watchedAddresses?.[idx]?.address || '';

  function createCalendarInviteForVisit(visit) {
    const calendarData = {
      contactName,
      visit,
      address: address
    };
    return onCalendarInvite(calendarData);
  }

  return (
    <div key={field.id} className={styles['address-item']}>
      <div className={`${styles['address-row']} mb-2`}>
        <div className={styles['address-cell-main']}>
          <Form.Control
            {...register(`addresses.${idx}.address`, { required: 'Address is required' })}
            placeholder={`Address #${idx + 1}`}
            className={styles['address-input-field']}
            isInvalid={!!(errors?.addresses && errors.addresses[idx]?.address)}
          />
          {errors?.addresses && errors.addresses[idx]?.address && (
            <Form.Control.Feedback type="invalid">
              {errors.addresses[idx].address.message}
            </Form.Control.Feedback>
          )}
        </div>
        <div className={styles['address-cell-actions']}>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              if (address) {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                window.open(mapsUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            tabIndex={-1}
            aria-label="Open in Google Maps"
            title="View on Google Maps"
            disabled={!address}
            className={styles['address-btn-maps']}
          >
            🗺️
          </Button>
          {totalAddresses > 1 && null}
          {totalAddresses > 1 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => removeAddress(idx)}
              tabIndex={-1}
              aria-label={`Remove address ${idx + 1}`}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
