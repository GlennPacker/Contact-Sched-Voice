function getDefaultPriceReviewDate() {
  const today = new Date();
  const sixMonths = new Date(today.setMonth(today.getMonth() + 6));

  return sixMonths.toISOString().split('T')[0];
}

import { getEnvRates } from './envService';

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

function getDefaultFormValues(initialValues = null) {
  const envRates = getEnvRates();
  if (initialValues) {
    return {
      ...initialValues,
      addresses: sortVisitsDescending(initialValues.addresses)
    };
  }

  return {
    priceReviewDate: getDefaultPriceReviewDate(),
    addresses: [{ address: '' }],
    rateFullDay: envRates.rateFullDay,
    rateHalfDay: envRates.rateHalfDay,
    rateTwoHour: envRates.rateTwoHour,
    rateHour: envRates.rateHour,
    rateJob: envRates.rateJob,
  };
}

function computeRateAdjustments(fullDayValue, currentHalfDay, currentTwoHour) {
  const envRates = getEnvRates();
  const val = +fullDayValue;
  if (!val) return {};

  const calcHalf = Math.ceil((val + 10) / 2 / 10) * 10;
  const updates = {};
  if (currentHalfDay === envRates.rateHalfDay) updates.rateHalfDay = calcHalf;

  if (currentTwoHour === envRates.rateTwoHour) {
    const calc = Math.ceil((calcHalf + 10) / 2 / 10) * 10;
    updates.rateTwoHour = calc;
  }

  return updates;
}

function buildPayloadFromForm(formData = {}) {
  const contactTypesArray = Object.entries(formData.contactTypes || {}).reduce((acc, [key, val]) => {
    if (val && val.selected) acc.push({ contactType: key, metadata: val.metadata || '' });

    return acc;
  }, []);

  return {
    name: formData.name,
    contactTypes: contactTypesArray,
    rateFullDay: formData.rateFullDay,
    rateHalfDay: formData.rateHalfDay,
    rateTwoHour: formData.rateTwoHour,
    rateHour: formData.rateHour,
    rateJob: formData.rateJob,
    priceReviewDate: formData.priceReviewDate,
    addresses: formData.addresses || [],
  };
}

export {
  getDefaultPriceReviewDate,
  getEnvRates,
  sortVisitsDescending,
  getDefaultFormValues,
  computeRateAdjustments,
  buildPayloadFromForm,
};
