import { Button, Form, Tab, Tabs } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import Address from './Address.jsx';
import Visits from '../Visit/Visits.jsx';
import styles from './Addresses.module.scss';
import { useWatch } from 'react-hook-form';

export default function Addresses({ addressFields, register, removeAddress, appendAddress: addAddress, errors, control, contactName, onCalendarInvite }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  let watchedAddresses = [];
  try {
    if (control && typeof control._getWatch === 'function') {
      watchedAddresses = useWatch({ control, name: 'addresses' }) || [];
    }
  } catch (e) {
    watchedAddresses = [];
  }

  useEffect(() => {
    if (selectedIndex >= addressFields.length) {
      setSelectedIndex(Math.max(0, addressFields.length - 1));
    }
  }, [addressFields.length]);

  return (
    <Form.Group className="mb-3">
      <div className="d-flex align-items-center gap-3">
        <span className={styles['section-title']}>Addresses *</span>
        <Button
variant="secondary"
size="sm"
type="button"
onClick={() => addAddress({ address: '' })}>
          Add Address
        </Button>
      </div>

      <div className={styles['addresses-top-right']}>
        {addressFields.map((field, idx) => (
          <Address
            key={field.id}
            field={field}
            idx={idx}
            register={register}
            errors={errors}
            removeAddress={removeAddress}
            totalAddresses={addressFields.length}
            contactName={contactName}
            control={control}
            onCalendarInvite={onCalendarInvite}
          />
        ))}
      </div>

      {errors?.addresses && typeof errors.addresses.message === 'string' && (
        <Form.Text className="text-danger">{errors.addresses.message}</Form.Text>
      )}

      {addressFields.length === 1 && (
        <div className="mt-3">
          <Visits
            nestIndex={0}
            control={control}
            register={register}
            errors={errors}
            createCalendarInvite={onCalendarInvite}
          />
        </div>
      )}

      {addressFields.length > 1 && (
        <Tabs
activeKey={selectedIndex}
onSelect={k => setSelectedIndex(+k)}
className="mt-3">
          {addressFields.map((field, idx) => {
            const addressText = (watchedAddresses?.[idx]?.address || '').trim();
            const title = addressText ? (addressText.length > 25 ? `${addressText.slice(0, 25)}…` : addressText) : `Address ${idx + 1}`;

            return (
              <Tab
eventKey={idx}
title={title}
key={field.id}>
                <div className="mt-3">
                  <Visits
                    nestIndex={idx}
                    control={control}
                    register={register}
                    errors={errors}
                    createCalendarInvite={onCalendarInvite}
                  />
                </div>
              </Tab>
            );
          })}
        </Tabs>
      )}
    </Form.Group>
  );
}
