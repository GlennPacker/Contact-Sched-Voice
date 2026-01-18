

const defaultClipboard = text => navigator.clipboard.writeText(text);
const defaultPopup = text => alert(text);

const defaultUtils = { clipboardFn: defaultClipboard, popupFn: defaultPopup };

import { VisitTime } from './referenceDataService';

const loadRate = (time, visitTime, rate, utils = defaultUtils) => {
  const { clipboardFn, popupFn } = utils;
  if (time !== visitTime) return;
  clipboardFn(rate);
  popupFn(`Rate: ${rate}`);
};

const loadRateData = (time, contact, loadRateFn = loadRate) => {
  loadRateFn(VisitTime.FULL_DAY, time, contact.rateFullDay);
  loadRateFn(VisitTime.HALF_DAY, time, contact.rateHalfDay);
  loadRateFn(VisitTime.TWO_HOUR, time, contact.rateTwoHour);
  loadRateFn(VisitTime.HOUR, time, contact.rateHour);
  loadRateFn(VisitTime.JOB, time, contact.rateJob);
};

const loadInvoiceData = (
  { visit, contact, address },
  rateFn = loadRateData,
  utils = defaultUtils
) => {
  const { clipboardFn, popupFn } = utils;
  clipboardFn(contact.name);
  popupFn(`Name: ${contact.name}`);
  clipboardFn(address.address);
  popupFn(`Address: ${address.address}`);
  rateFn(visit.time, contact, loadRate);
};

export {
  loadRate,
  loadRateData,
  loadInvoiceData
};