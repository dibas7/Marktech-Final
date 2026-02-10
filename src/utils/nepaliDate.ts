// Nepali Calendar (Bikram Sambat) Converter
// Based on the official Nepali calendar conversion algorithm

// Days in each month for Nepali years 2070-2090 BS
const nepaliMonthDays: { [key: number]: number[] } = {
  2070: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2085: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2086: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2087: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2088: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2089: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2090: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
};

// Reference: 2081/01/01 BS = 2024/04/13 AD (Baisakh 1, 2081 = April 13, 2024)
const referenceNepaliYear = 2081;
const referenceNepaliMonth = 1;
const referenceNepaliDay = 1;
const referenceEnglishDate = new Date(2024, 3, 13); // April 13, 2024

function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  // Normalize to UTC midnight to avoid timezone issues
  const d1 = new Date(Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()));
  const d2 = new Date(Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()));
  return Math.round((d1.getTime() - d2.getTime()) / oneDay);
}

function getTotalDaysInYear(year: number): number {
  if (nepaliMonthDays[year]) {
    return nepaliMonthDays[year].reduce((a, b) => a + b, 0);
  }
  return 365; // fallback
}

export interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

export function convertToNepaliDate(englishDate: Date): NepaliDate {
  let daysDiff = getDaysDifference(englishDate, referenceEnglishDate);
  
  let nepaliYear = referenceNepaliYear;
  let nepaliMonth = referenceNepaliMonth;
  let nepaliDay = referenceNepaliDay;

  if (daysDiff >= 0) {
    // Forward calculation
    nepaliDay += daysDiff;
    
    while (nepaliMonthDays[nepaliYear]) {
      const daysInCurrentMonth = nepaliMonthDays[nepaliYear][nepaliMonth - 1];
      if (nepaliDay <= daysInCurrentMonth) {
        break;
      }
      nepaliDay -= daysInCurrentMonth;
      nepaliMonth++;
      if (nepaliMonth > 12) {
        nepaliMonth = 1;
        nepaliYear++;
      }
    }
  } else {
    // Backward calculation
    daysDiff = Math.abs(daysDiff);
    
    while (daysDiff > 0 && nepaliMonthDays[nepaliYear]) {
      if (nepaliDay > daysDiff) {
        nepaliDay -= daysDiff;
        daysDiff = 0;
      } else {
        daysDiff -= nepaliDay;
        nepaliMonth--;
        if (nepaliMonth < 1) {
          nepaliMonth = 12;
          nepaliYear--;
        }
        if (nepaliMonthDays[nepaliYear]) {
          nepaliDay = nepaliMonthDays[nepaliYear][nepaliMonth - 1];
        }
      }
    }
  }

  return {
    year: nepaliYear,
    month: nepaliMonth,
    day: nepaliDay,
  };
}

export function formatNepaliDate(date: Date | string): string {
  const englishDate = typeof date === 'string' ? new Date(date) : date;
  const nepaliDate = convertToNepaliDate(englishDate);
  
  // Format as YYYY/MM/DD B.S.
  const year = nepaliDate.year;
  const month = String(nepaliDate.month).padStart(2, '0');
  const day = String(nepaliDate.day).padStart(2, '0');
  
  return `${year}/${month}/${day} B.S.`;
}
