import { Button, Form } from 'react-bootstrap';

import styles from './Addresses.module.scss';
import Address from './Address.jsx';

export default function Addresses({ addressFields, register, removeAddress, appendAddress: addAddress, errors, control, contactName, onCalendarInvite }) {
  return (
    <Form.Group className="mb-3">
      <div className="d-flex align-items-center gap-3">
        <span className={styles['section-title']}>Addresses *</span>
        <Button variant="secondary" size="sm" type="button" onClick={() => addAddress({ address: '' })}>
          Add Address
        </Button>
      </div>

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

      {errors?.addresses && typeof errors.addresses.message === 'string' && (
        <Form.Text className="text-danger">{errors.addresses.message}</Form.Text>
      )}
    </Form.Group>
  );
}
