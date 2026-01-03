import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap';

import styles from './Addresses.module.scss';
import Address from './Address.jsx';
import Visits from '../Visit/Visits.jsx';

export default function Addresses({ addressFields, register, removeAddress, appendAddress: addAddress, errors, control, contactName, onCalendarInvite }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    // ensure selectedIndex remains valid if addresses change
    if (selectedIndex >= addressFields.length) {
      setSelectedIndex(Math.max(0, addressFields.length - 1))
    }
  }, [addressFields.length])

  return (
    <Form.Group className="mb-3">
      <div className="d-flex align-items-center gap-3">
        <span className={styles['section-title']}>Addresses *</span>
        <Button variant="secondary" size="sm" type="button" onClick={() => addAddress({ address: '' })}>
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
            isSelected={addressFields.length === 1 ? true : selectedIndex === idx}
            onSelect={() => setSelectedIndex(idx)}
          />
        ))}
      </div>

      {errors?.addresses && typeof errors.addresses.message === 'string' && (
        <Form.Text className="text-danger">{errors.addresses.message}</Form.Text>
      )}

      {(addressFields.length > 0) && (
        <div className="mt-3">
          <Visits
            key={selectedIndex}
            nestIndex={selectedIndex}
            control={control}
            register={register}
            errors={errors}
            createCalendarInvite={onCalendarInvite}
          />
        </div>
      )}
    </Form.Group>
  )
}
