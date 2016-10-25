import moment from 'moment';

import * as giftDates from './giftDates.service';

describe('giftDates service', () => {
  describe('possibleTransactionDays', () => {
    it('should calculate gift start date', () => {
      expect(giftDates.possibleTransactionDays()).toEqual([
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '25', '26', '27', '28'
      ]);
    });
  });

  describe('quarterlyMonths', () => {
    it('should get the months for quarterly gifts starting with the nextDrawDate', () => {
      expect(giftDates.quarterlyMonths(10, '2015-11-10')).toEqual('November, February, May, and August');
      expect(giftDates.quarterlyMonths(10, '2015-12-10')).toEqual('December, March, June, and September');
      expect(giftDates.quarterlyMonths(10, '2016-01-10')).toEqual('January, April, July, and October');
    });
    it('should get the months for quarterly gifts taking transaction day into account', () => {
      expect(giftDates.quarterlyMonths(9, '2015-11-10')).toEqual('December, March, June, and September');
      expect(giftDates.quarterlyMonths(9, '2015-12-10')).toEqual('January, April, July, and October');
      expect(giftDates.quarterlyMonths(9, '2016-01-10')).toEqual('February, May, August, and November');
    });
    it('should get the months for quarterly gifts taking the monthOffset into account', () => {
      expect(giftDates.quarterlyMonths(9, '2015-01-01')).toEqual('January, April, July, and October');
      expect(giftDates.quarterlyMonths(9, '2015-01-01', 1)).toEqual('February, May, August, and November');
      expect(giftDates.quarterlyMonths(9, '2015-01-01', 2)).toEqual('March, June, September, and December');
    });
  });

  describe('startDate', () => {
    it('should calculate gift start date', () => {
      expect(giftDates.startDate('10', '2017-01-02').toString()).toEqual(moment('2017-01-10').toString());
      expect(giftDates.startDate(10, '2017-01-02').toString()).toEqual(moment('2017-01-10').toString());
      expect(giftDates.startDate('1', '2017-01-02').toString()).toEqual(moment('2017-02-01').toString());
      expect(giftDates.startDate('1', '2016-12-31').toString()).toEqual(moment('2017-01-01').toString());
    });
    it('should support month offsets', () => {
      expect(giftDates.startDate('10', '2017-01-02', 1).toString()).toEqual(moment('2017-02-10').toString());
      expect(giftDates.startDate('10', '2017-01-02', 2).toString()).toEqual(moment('2017-03-10').toString());
      expect(giftDates.startDate('1', '2017-01-02', 2).toString()).toEqual(moment('2017-04-01').toString());
    });
    it('should allow transaction day to be null', () => {
      // Currently used to display quarter months based on nextDrawDate only
      expect(giftDates.startDate(null, '2017-01-02').toString()).toEqual(moment('2017-01-02').toString());
      expect(giftDates.startDate(null, '2017-01-02').toString()).toEqual(moment('2017-01-02').toString());
      expect(giftDates.startDate(null, '2017-01-02', 1).toString()).toEqual(moment('2017-02-02').toString());
    });
  });

  describe('startMonth', () => {
    it('should calculate gift start date', () => {
      expect(giftDates.startMonth('10', '1', '2017-01-02').toString()).toEqual(moment('2017-01-10').toString());
      expect(giftDates.startMonth(10,  1, '2017-01-02').toString()).toEqual(moment('2017-01-10').toString());
      expect(giftDates.startMonth('1', 1, '2017-01-02').toString()).toEqual(moment('2018-01-01').toString());
      expect(giftDates.startMonth('1', 12, '2016-12-31').toString()).toEqual(moment('2017-12-01').toString());
    });
    it('should support month offsets', () => {
      expect(giftDates.startMonth('10', 1, '2017-01-02', 1).toString()).toEqual(moment('2017-02-10').toString());
      expect(giftDates.startMonth('10', 1, '2017-01-02', 2).toString()).toEqual(moment('2017-03-10').toString());
      expect(giftDates.startMonth('1', 1, '2017-01-02', 2).toString()).toEqual(moment('2018-03-01').toString());
    });
  });
});