import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import Addresses from '../Address/Addresses'
import { contactCreateAppointment } from '../../lib/calendarService';
import styles from '../../pages/contacts/CreateContact.module.scss';

export default function Contact({ initialValues = null, onSubmit, priceReviewDateReadOnly = false }) {
  const defaultPriceReviewDate = (() => {
    const today = new Date()
    const sixMonths = new Date(today.setMonth(today.getMonth() + 6))
    return sixMonths.toISOString().split('T')[0]
  })()

  const envRates = {
    fullDay: Number(process.env.NEXT_PUBLIC_RATE_FULL_DAY ?? 0),
    halfDay: Number(process.env.NEXT_PUBLIC_RATE_HALF_DAY ?? 0),
    twoHour: Number(process.env.NEXT_PUBLIC_RATE_TWO_HOUR ?? 0),
    hour: Number(process.env.NEXT_PUBLIC_RATE_HOUR ?? 0),
  }

  function sortVisitsDescending(addresses) {
    if (!Array.isArray(addresses)) return addresses;
    return addresses.map(addr => {
      if (!Array.isArray(addr.visits)) return addr;
      return {
        ...addr,
        visits: [...addr.visits].sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.localeCompare(a.date);
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
        rates: { ...envRates }
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
  const halfDay = watch('rates.halfDay')
  const twoHour = watch('rates.twoHour')
  const watchedForm = useWatch({ control });

  const fullDayBlur = (e) => {
    const val = Number(e.target.value);
    if(!val) return;

    const calcHalf = Math.ceil((val + 10) / 2 / 10) * 10;
    if (halfDay === envRates.halfDay) {
        setValue('rates.halfDay', calcHalf, { shouldValidate: true, shouldDirty: true });
    }

    if(twoHour === envRates.twoHour) {
        const calc = Math.ceil((calcHalf + 10) / 2 / 10) * 10;
        setValue('rates.twoHour', calc, { shouldValidate: true, shouldDirty: true });
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
    { id: 'faceBookHandyman', label: 'Facebook (Handyman)' },
    { id: 'Whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
  ]

  const watchedTypes = watch('contactTypes') || {}

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const formSubmit = async (formData) => {
    setError(null)
    setSuccess(null)

    try {
      const contactTypesArray = Object.entries(formData.contactTypes || {}).reduce((acc, [key, val]) => {
        if (val && val.selected) acc.push({ contactType: key, metadata: val.metadata ?? '' })
        return acc
      }, [])

      const payload = {
        name: formData.name,
        contactTypes: contactTypesArray,
        rates: formData.rates || {},
        priceReviewDate: formData.priceReviewDate,
      }

      const result = await onSubmit(payload)

      if (result?.error) {
        setError(result.error.message || 'Failed to save')
      } else {
        setSuccess('Saved successfully.')
        reset(defaultFormValues)
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    }
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit(formSubmit)} className="form-grid">
        <div className="form-grid__col1">
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className={styles['section-title']}>Name *</Form.Label>
            <Form.Control {...register('name', { required: 'Name is required' })} placeholder="Full name" />
            {errors.name && <Form.Text className="text-danger">{errors.name.message}</Form.Text>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="contactTypes">
            <Form.Label className={styles['section-title']}>Contact types *</Form.Label>
            {CONTACT_TYPE_OPTIONS.map((opt) => {
              const isEmail = opt.id === 'email'
              const isWhatsapp = opt.id === 'Whatsapp'
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
              <div className="form-field-row">
                <Form.Label className="small form-field-label">Full day</Form.Label>
                <div className="form-field-control">
                  <Form.Control type="number" step="0.01" {...register('rates.fullDay', { valueAsNumber: true })} placeholder="Full day rate" onBlur={fullDayBlur} />
                  {errors?.rates?.fullDay && <Form.Text className="text-danger">{errors.rates.fullDay.message}</Form.Text>}
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className="form-field-row">
                <Form.Label className="small form-field-label">Half day</Form.Label>
                <div className="form-field-control">
                  <Form.Control type="number" {...register('rates.halfDay', { valueAsNumber: true })} placeholder="Half day rate" />
                  {errors?.rates?.halfDay && <Form.Text className="text-danger">{errors.rates.halfDay.message}</Form.Text>}
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className="form-field-row">
                <Form.Label className="small form-field-label">2 hour</Form.Label>
                <div className="form-field-control">
                  <Form.Control type="number" {...register('rates.twoHour', { valueAsNumber: true })} placeholder="2 hour rate" />
                  {errors?.rates?.twoHour && <Form.Text className="text-danger">{errors.rates.twoHour.message}</Form.Text>}
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className="form-field-row">
                <Form.Label className="small form-field-label">Hour</Form.Label>
                <div className="form-field-control">
                  <Form.Control type="number" {...register('rates.hour', { valueAsNumber: true })} placeholder="Hourly rate" />
                </div>
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <div className="form-field-row">
                <Form.Label className="small form-field-label">Job</Form.Label>
                <div className="form-field-control">
                  <Form.Control type="number" {...register('rates.job', { valueAsNumber: true })} placeholder="Per job rate" />
                </div>
              </div>
            </Form.Group>
          </Form.Group>
          <Form.Group className="mb-2">
            <div className="form-field-row">
              <Form.Label className={ `small form-field-label ${priceReviewDateReadOnly ? `u-label-readonly`: ``}`}>Review *</Form.Label>
              <div className="form-field-control">
                <Form.Control
                  type="date"
                  readOnly={priceReviewDateReadOnly}
                  className={`${styles['review-date-input']}${priceReviewDateReadOnly ? ' u-input-readonly' : ''}`}
                  {...register('priceReviewDate')}
                />
              </div>
            </div>
          </Form.Group>
        </div>
        <div className="form-grid__col2">
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
        <div className="form-grid__actions">
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
