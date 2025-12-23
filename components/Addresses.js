
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Visits from './Visits';
import styles from './Addresses.module.scss';
import { useWatch } from 'react-hook-form';

export default function Addresses({ addressFields, register, removeAddress, appendAddress: addAddress, errors, control, contactName, onCalendarInvite }) {
  const [expanded, setExpanded] = useState(() => addressFields.map(() => true));
  const watchedAddresses = useWatch({ control, name: 'addresses' });

  const toggleExpand = (idx) => {
    setExpanded(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  function handleCreateCalendarInvite(idx, visit) {
    const calendarData = {
      contactName,
      visit,
      address: watchedAddresses?.[idx]?.address || ''
    };
    return onCalendarInvite(calendarData);
  }

  return (
    <Form.Group className="mb-3">
      <div className="d-flex align-items-center gap-3">
          <span className={styles['section-title']}>Addresses *</span>
        <Button variant="secondary" size="sm" type="button" onClick={() => addAddress({ address: '' })}>
          Add Address
        </Button>
      </div>

      {addressFields.map((field, idx) => {
        const address = watchedAddresses?.[idx]?.address || '';
        return (
          <div key={field.id} className={styles['address-item']}>
            <div className="mb-2 d-flex align-items-center gap-2">
              <Form.Control
                {...register(`addresses.${idx}.address`, { required: 'Address is required' })}
                placeholder={`Address #${idx + 1}`}
                className={styles['address-input-field']}
                value={address}
                isInvalid={!!(errors?.addresses && errors.addresses[idx]?.address)}
              />
              {errors?.addresses && errors.addresses[idx]?.address && (
                <Form.Control.Feedback type="invalid">
                  {errors.addresses[idx].address.message}
                </Form.Control.Feedback>
              )}
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => toggleExpand(idx)}
                tabIndex={-1}
                aria-label={expanded[idx] ? "Collapse visits" : "Expand visits"}
                title={expanded[idx] ? "Hide visits" : "Show visits"}
                className={styles['address-btn-expand']}
              >
                {`Visits ${expanded[idx] ? '−' : '+'}`}
              </Button>
              {addressFields.length > 1 && (
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
            {expanded[idx] && (
              <Visits
                nestIndex={idx}
                control={control}
                register={register}
                errors={errors}
                createCalendarInvite={(visit) => handleCreateCalendarInvite(idx, visit)}
              />
            )}
          </div>
        );
      })}
      {errors?.addresses && typeof errors.addresses.message === 'string' && (
        <Form.Text className="text-danger">{errors.addresses.message}</Form.Text>
      )}
    </Form.Group>
  );
}
