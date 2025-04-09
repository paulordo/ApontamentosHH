import moment, { Moment } from 'moment';
import momentTimezone from 'moment-timezone';
import 'moment/locale/pt-br';

const MINUTE_MILLISECONDS = 60 * 1000;
const DAY_MILLISECONDS = 86400000;
const MS_DAY_OFFSET = 25569;

class MomentUtils {

   constructor() {

      const momentVersion = moment.version.split('.');
      const major = +momentVersion[0];
      const minor = +momentVersion[1];

      if (major < 2 || (major === 2 && minor < 6)) {
         throw new Error('MomentUtils requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
      }

      if (!momentTimezone || !moment.tz) {
         throw new Error('MomentUtils requires moment-timezone.js. see momentjs.com/timezone');
      }

   }

   private oaDateToTicks = (oaDate: number): number => {
      let ticks = ((oaDate - MS_DAY_OFFSET) * DAY_MILLISECONDS);
      if (oaDate < 0) {
         const frac = (oaDate - Math.trunc(oaDate)) * DAY_MILLISECONDS;
         if (frac !== 0) {
            ticks -= frac * 2;
         }
      }
      return ticks;
   };

   private ticksToOADate = function (ticks: number) {
      let oad = (ticks / DAY_MILLISECONDS) + MS_DAY_OFFSET;
      if (oad < 0) {
         const frac = oad - Math.trunc(oad);
         if (frac !== 0) {
            oad = Math.ceil(oad) - frac - 2;
         }
      }
      return oad;
   };

   /**
    * @description takes an oaDate that is not in utc and converts it to a utc moment offset by a number of minutes
    *
    * @param {double} oaDate
    * @param {string} offsetToUtcInMinutes
    * @returns moment
    */
   private fromOADateOffsetToUtcByMinutes = (oaDate: number, offsetToUtcInMinutes: number): Moment => {
      const offsetInTicks = offsetToUtcInMinutes * MINUTE_MILLISECONDS;
      const ticks = this.oaDateToTicks(oaDate);
      return moment(ticks + offsetInTicks).utc();
   };

   /**
    * @description takes an oaDate that is not in utc and converts it to a utc moment offset by the specified timezone
    *
    * @param {double} oaDate
    * @param {string} timezone
    * @returns moment
    */
   private fromOADateOffsetToUtcByTimezone = (oaDate: number, timezone: string): Moment => {
      if (!moment.tz.zone(timezone)) {
         throw new Error('timezone provided is not available in moment-timezone.js');
      }
      const ticks = this.oaDateToTicks(oaDate);
      const offset = moment(ticks).tz(timezone).utcOffset() * MINUTE_MILLISECONDS;
      return moment.tz(ticks - offset, timezone).utc();
   };


   /**
    * @description converts a moment to a UTC OLE automation date represented as a double
    *
    * @returns {double}
    */

   toOADate = (_moment: Moment): number => {
      const milliseconds = _moment.valueOf();
      return this.ticksToOADate(milliseconds);
   }

   formatOADate = (doubleValue: number, type: 'date' | 'time' | 'datetime'): number => {
      let value = 0;
      switch (type) {
         case 'date':
            value = Math.trunc(Number(doubleValue));
            break;
         case 'time':
            value = Math.abs(Number(doubleValue));
            value = value - Math.floor(value);
            break;
         default: value = doubleValue;
      }

      return value;
   }

   /**
    * @description takes an oaDate that is in utc and converts it to a utc moment or takes an oaDate and an offset to utc and converts it to a utc moment. The offset can be an int representing the offset to utc in minutes or a string indicating the timezone of the oaDate.
    *
    * @param {number} oaDate
    * @param {string=} offset
    * @returns moment
    */

   fromOADate = (oaDate: number, offset?: string): Moment => {
      if (Number.isNaN(parseInt(String(oaDate), 10))) {
         throw new TypeError('fromOADate requires an oaDate that is not null or undefined');
      }

      /* no offset */
      if (!offset) {
         return this.fromOADateOffsetToUtcByMinutes(oaDate, 0);
      }

      /* timezone */
      const parsedOffset = parseInt(offset, 10);
      if (Number.isNaN(parsedOffset)) {
         return this.fromOADateOffsetToUtcByTimezone(oaDate, offset);
      }

      /* minutes */
      return this.fromOADateOffsetToUtcByMinutes(oaDate, parsedOffset);
   };

   fromOATime = (doubleValue: number): Moment => {
      return this.fromOADate(doubleValue);
   }

   fromOADateTime = (doubleValue: number): Moment => {
      const value = doubleValue + 0.00001157404;
      return this.fromOADate(value);
   }

   /* MISC */

   actualTime = (currentDate: Moment): Date => {
      const date = new Date();

      date.setFullYear(currentDate.year());
      date.setMonth(currentDate.month());
      date.setDate(currentDate.date());
      date.setHours(currentDate.hours());
      date.setMinutes(currentDate.minutes());
      date.setSeconds(currentDate.seconds());
      date.setMilliseconds(currentDate.milliseconds());

      return date;
   }

   firstMonthDay = (currentDate: Moment): Moment => {
      return currentDate.startOf('month');
   }

   firstMonthDayOADate = (currentDate: Moment): number => {
      return this.toOADate(this.firstMonthDay(currentDate));
   }

   lastMonthDay = (currentDate: Moment): Moment => {
      return currentDate.endOf('month');
   }

   lastMonthDayOADate = (currentDate: Moment): number => {
      return this.toOADate(this.lastMonthDay(currentDate));
   }

}

export const momentUtils = new MomentUtils();