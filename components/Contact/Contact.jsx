import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import Addresses from '../Address/Addresses'
import { contactCreateAppointment } from '../../lib/visitUtils';
import styles from './Contact.module.scss';

export default function Contact({ initialValues = null, submit, priceReviewDateReadOnly = false }) {
  const defaultPriceReviewDate = (() => {
    const today = new Date()
    const sixMonths = new Date(today.setMonth(today.getMonth() + 6))
    return sixMonths.toISOString().split('T')[0]
  })()

  const envRates = {
    rateFullDay: +(process.env.NEXT_PUBLIC_RATE_FULL_DAY ?? 0),
    rateHalfDay: +(process.env.NEXT_PUBLIC_RATE_HALF_DAY ?? 0),
    rateTwoHour: +(process.env.NEXT_PUBLIC_RATE_TWO_HOUR ?? 0),
    rateHour: +(process.env.NEXT_PUBLIC_RATE_HOUR ?? 0),
    rateJob: +(process.env.NEXT_PUBLIC_RATE_JOB ?? 0),
  }

  function sortVisitsDescending(addresses) {
    if (!Array.isArray(addresses)) return addresses;
    return addresses.map(addr => {
      if (!Array.isArray(addr.visits)) return addr;
      return {
        ...addr,
        visits: [...addr.visits].sort((a, b) => {
          if (!a.visitDate && !b.visitDate) return 0;
          if (!a.visitDate) return 1;
          if (!b.visitDate) return -1;
          return b.visitDate.localeCompare(a.visitDate);
        })
      };
    });
  }

  const defaultFormValues = initialValues
    ? {
      ...initialValues,
      addresses: sortVisitsDescending(initialValues.addresses)
    }
    : {
      priceReviewDate: defaultPriceReviewDate,
      addresses: [{ address: '' }],
      rateFullDay: envRates.rateFullDay,
      rateHalfDay: envRates.rateHalfDay,
      rateTwoHour: envRates.rateTwoHour,
      rateHour: envRates.rateHour,
      rateJob: envRates.rateJob,
    };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultFormValues })
  const priceReviewDateValue = watch('priceReviewDate')
  const halfDay = watch('rateHalfDay')
  const twoHour = watch('rateTwoHour')
  const watchedForm = useWatch({ control });

  const fullDayBlur = (e) => {
    const val = Number(e.target.value);
    if (!val) return;

    const calcHalf = Math.ceil((val + 10) / 2 / 10) * 10;
    if (halfDay === envRates.rateHalfDay) {
      setValue('rateHalfDay', calcHalf, { shouldValidate: true, shouldDirty: true });
    }

    if (twoHour === envRates.rateTwoHour) {
      const calc = Math.ceil((calcHalf + 10) / 2 / 10) * 10;
      setValue('rateTwoHour', calc, { shouldValidate: true, shouldDirty: true });
    }
  };

  const { fields: addressFields, append: addAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses',
  })

  useEffect(() => {
    if (!addressFields.length) {
      addAddress({ address: '' })
    }
  }, [addressFields, addAddress])

  const CONTACT_TYPE_OPTIONS = [
    { id: 'facebookGlenn', label: 'Facebook (Glenn)' },
    { id: 'facebookHandyman', label: 'Facebook (Handyman)' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
  ]

  const watchedTypes = watch('contactTypes') || {}

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [warnings, setWarnings] = useState([])

  const formSubmit = async (formData) => {
    setError(null)
    setSuccess(null)
    setWarnings([])

    try {
      const contactTypesArray = Object.entries(formData.contactTypes || {}).reduce((acc, [key, val]) => {
        if (val && val.selected) acc.push({ contactType: key, metadata: val.metadata ?? '' })
        return acc
      }, [])

      const payload = {
        name: formData.name,
        contactTypes: contactTypesArray,
        rateFullDay: formData.rateFullDay,
        rateHalfDay: formData.rateHalfDay,
        rateTwoHour: formData.rateTwoHour,
        rateHour: formData.rateHour,
        rateJob: formData.rateJob,
        priceReviewDate: formData.priceReviewDate,
        addresses: formData.addresses || [],
      }

      const result = await submit(payload)

      if (result?.error) {
        setError(result.error.message || 'Failed to save')
        if (result?.data && Array.isArray(result.data.warnings) && result.data.warnings.length) {
          setWarnings(result.data.warnings)
        }
      } else {
        setSuccess('Saved successfully.')
        if (result?.data && Array.isArray(result.data.warnings) && result.data.warnings.length) {
          setWarnings(result.data.warnings)
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    }
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {warnings && !!warnings.length && (
        <Alert variant="info">
          {warnings.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit(formSubmit)} className={styles['form-grid']}>
        <div className={styles['form-grid__col1']}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className={styles['section-title']}>Name *</Form.Label>
            <Form.Control {...register('name', { required: 'Name is required' })} placeholder="Full name" />
            {errors.name && <Form.Text className="text-danger">{errors.name.message}</Form.Text>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="contactTypes">
            <Form.Label className={styles['section-title']}>Contact types *</Form.Label>
            {CONTACT_TYPE_OPTIONS.map((opt) => {
              const isEmail = opt.id === 'email'
              const isWhatsapp = opt.id === 'whatsapp'
              const isSelected = Boolean(watchedTypes[opt.id]?.selected)
              return (
                <div key={opt.id} className="mb-3">
                  <Form.Check type="checkbox" id={`ct-${opt.id}`} label={opt.label} {...register(`contactTypes.${opt.id}.selected`)} />
                  {isSelected && isEmail && (
                    <>
                      <Form.Control
                        className="mt-2"
                        type="email"
                        placeholder="name@example.com"
                        {...register(`contactTypes.${opt.id}.metadata`, {
                          required: 'Email is required when Email contact type is selected',
                          pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email address' },
                        })}
                      />
                      {errors?.contactTypes?.[opt.id]?.metadata && (
                        <Form.Text className="text-danger">{errors.contactTypes[opt.id].metadata.message}</Form.Text>
                      )}
                    </>
                  )}
                  {isSelected && isWhatsapp && (
                    <>
                      <Form.Control
                        className="mt-2"
                        type="text"
                        placeholder="WhatsApp number or handle"
                        {...register(`contactTypes.${opt.id}.metadata`, {
                          required: 'WhatsApp metadata is required when WhatsApp contact type is selected',
                        })}
                      />
                      {errors?.contactTypes?.[opt.id]?.metadata && (
                        <Form.Text className="text-danger">{errors.contactTypes[opt.id].metadata.message}</Form.Text>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </Form.Group>
          <Form.Group className="mb-3" controlId="rates">
            <Form.Label className={styles['section-title']}>Rates *</Form.Label>
            <Form.Group className="mb-2">
              <div className={styles['form-field-row']}>
                <Form.Label className={`small ${styles['form-field-label']}`}>Full day</Form.Label>
                <div className={styles['form-field-control']}>
                  <Form.Control type="number" step="0.01" {...register('rateFullDay', { valueAsNumber: true })} placeholder="Full day rate" onBlur={fullDayBlur} />
                  {errors?.rateFullDay && <Form.Text className="text-danger">{errors.rateFullDay.message}</Form.Text>}
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className={styles['form-field-row']}>
                <Form.Label className={`small ${styles['form-field-label']}`}>Half day</Form.Label>
                <div className={styles['form-field-control']}>
                  <Form.Control type="number" {...register('rateHalfDay', { valueAsNumber: true })} placeholder="Half day rate" />
                  {errors?.rateHalfDay && <Form.Text className="text-danger">{errors.rateHalfDay.message}</Form.Text>}
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className={styles['form-field-row']}>
                <Form.Label className={`small ${styles['form-field-label']}`}>2 hour</Form.Label>
                <div className={styles['form-field-control']}>
                  <Form.Control type="number" {...register('rateTwoHour', { valueAsNumber: true })} placeholder="2 hour rate" />
                  {errors?.rateTwoHour && <Form.Text className="text-danger">{errors.rateTwoHour.message}</Form.Text>}
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className={styles['form-field-row']}>
                <Form.Label className={`small ${styles['form-field-label']}`}>Hour</Form.Label>
                <div className={styles['form-field-control']}>
                  <Form.Control type="number" {...register('rateHour', { valueAsNumber: true })} placeholder="Hourly rate" />
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className={styles['form-field-row']}>
                <Form.Label className={`small ${styles['form-field-label']}`}>Job</Form.Label>
                <div className={styles['form-field-control']}>
                  <Form.Control type="number" {...register('rateJob', { valueAsNumber: true })} placeholder="Per job rate" />
                </div>
              </div>
            </Form.Group>
          </Form.Group>
          <Form.Group className="mb-2">
            <div className={styles['form-field-row']}>
              <Form.Label className={`small ${styles['form-field-label']} ${priceReviewDateReadOnly ? styles['u-label-readonly'] : ''}`}>{priceReviewDateReadOnly ? 'Review' : 'Review *'}</Form.Label>
              <div className={styles['form-field-control']}>
                {priceReviewDateReadOnly ? (
                  <div className={`${styles['review-date-input']} ${styles['u-input-readonly']}`}>{priceReviewDateValue}</div>
                ) : (
                  <Form.Control
                    type="date"
                    className={styles['review-date-input']}
                    {...register('priceReviewDate')}
                  />
                )}
              </div>
            </div>
          </Form.Group>
        </div>
        <div className={styles['form-grid__col2']}>
          <Addresses
            addressFields={addressFields}
            register={register}
            removeAddress={removeAddress}
            appendAddress={addAddress}
            errors={errors}
            control={control}
            watchedForm={watchedForm}
            contactName={watchedForm?.name || ''}
            onCalendarInvite={({ contactName, visit, address }) => contactCreateAppointment({ contactName, visit, address })}
          />
        </div>
        <div className={styles['form-grid__actions']}>
          <Button type="submit" disabled={isSubmitting} variant="primary">
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden /> Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>{' '}
        </div>
      </Form>
    </>
  )
}
