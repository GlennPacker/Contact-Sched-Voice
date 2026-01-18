import * as invoiceLoaderService from './invoiceLoaderService';

import { VisitTime } from './referenceDataService';

describe('invoiceLoaderService', () => {
  let originalClipboard;
  let clipboardData = '';
  let popupMessages = [];

  beforeAll(() => {
    originalClipboard = { ...global.navigator.clipboard };
    global.navigator.clipboard = {
      writeText: jest.fn(text => { clipboardData = text; })
    };
    jest.spyOn(window, 'alert').mockImplementation(msg => popupMessages.push(msg));
  });

  beforeEach(() => {
    clipboardData = '';
    popupMessages = [];
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.navigator.clipboard = originalClipboard;
    window.alert.mockRestore();
  });

  it('loadRate only copies and pops up for matching time', () => {
    const mockClipboard = jest.fn();
    const mockPopup = jest.fn();
    const utils = { clipboardFn: mockClipboard, popupFn: mockPopup };
    invoiceLoaderService.loadRate(VisitTime.FULL_DAY, VisitTime.FULL_DAY, 123, utils);
    expect(mockClipboard).toHaveBeenCalledWith(123);
    expect(mockPopup).toHaveBeenCalledWith('Rate: 123');

    mockClipboard.mockClear();
    mockPopup.mockClear();
    invoiceLoaderService.loadRate(VisitTime.HALF_DAY, VisitTime.FULL_DAY, 456, utils);
    expect(mockClipboard).not.toHaveBeenCalled();
    expect(mockPopup).not.toHaveBeenCalled();
  });


  describe('loadRateData calls loadRate for each rate type', () => {
    const contact = {
      rateFullDay: 1,
      rateHalfDay: 2,
      rateTwoHour: 3,
      rateHour: 4,
      rateJob: 5
    };
    const cases = [
      ['FULL_DAY', 'rateFullDay', 1, 'full day'],
      ['HALF_DAY', 'rateHalfDay', 2, '1/2 day'],
      ['TWO_HOUR', 'rateTwoHour', 3, '2 hours'],
      ['HOUR', 'rateHour', 4, 'hour'],
      ['JOB', 'rateJob', 5, 'job'],
    ];
    it.each(cases)('calls loadRate for %s', (label, rateKey, expected, visitTime) => {
      const mockLoadRate = jest.fn();
      const singleContact = { ...contact };
      invoiceLoaderService.loadRateData('full day', singleContact, mockLoadRate);
      expect(mockLoadRate).toHaveBeenCalledWith(visitTime, 'full day', expected);
    });
  });
  it('loadRate returns early if time does not match visitTime', () => {
    const mockClipboard = jest.fn();
    const mockPopup = jest.fn();
    const utils = { clipboardFn: mockClipboard, popupFn: mockPopup };
    invoiceLoaderService.loadRate(VisitTime.HALF_DAY, VisitTime.FULL_DAY, 123, utils);
    expect(mockClipboard).not.toHaveBeenCalled();
    expect(mockPopup).not.toHaveBeenCalled();
  });


  it('loadInvoiceData calls all dependencies as mocks (pure unit)', () => {
    const visit = { time: VisitTime.FULL_DAY };
    const contact = {
      rateFullDay: 1,
      rateHalfDay: 2,
      rateTwoHour: 3,
      rateHour: 4,
      rateJob: 5,
      name: 'Test Name'
    };
    const address = { address: '123 Main St' };
    const mockRateFn = jest.fn();
    const utils = {
      clipboardFn: jest.fn(),
      popupFn: jest.fn()
    };
    invoiceLoaderService.loadInvoiceData({ visit, contact, address }, mockRateFn, utils);
    expect(utils.clipboardFn).toHaveBeenCalledWith('Test Name');
    expect(utils.popupFn).toHaveBeenCalledWith('Name: Test Name');
    expect(utils.clipboardFn).toHaveBeenCalledWith('123 Main St');
    expect(utils.popupFn).toHaveBeenCalledWith('Address: 123 Main St');
    expect(mockRateFn).toHaveBeenCalledWith(visit.time, contact, invoiceLoaderService.loadRate);
  });
});
