export enum Month {
    January = 1,
    February,
    March,
    April,
    May,
    June,
    July,
    August,
    September,
    October,
    November,
    December,
}

export function dateMonthYearString(dateTime: Date) {
    return dateTime.toISOString().split("T")[0];
}

export function toISTString(date: Date) {
    const options = { timeZone: "Asia/Kolkata", hour12: false };
    return date.toLocaleString("en-GB", options).replace(",", "");
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function keepAlive() {
    setTimeout(keepAlive, 50000); // 1-second intervals
}

//Comparing dates in format of YYYY-MM-DD
export function compareDates(date1: string, date2: string): number {
    const parsedDate1 = new Date(date1);
    const parsedDate2 = new Date(date2);

    if (parsedDate1 < parsedDate2) {
        return -1; // date1 is earlier than date2
    } else if (parsedDate1 > parsedDate2) {
        return 1; // date1 is later than date2
    } else {
        return 0; // date1 is the same as date2
    }
}

export function addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date.getTime() + minutes * 60000); // 60000 ms in one minute
    //console.log(`Add minutes: Original: ${date}, result: ${result}`);
    return result;
}

export function getMarketCloseTime(currentDateTime: Date) {
    const currentMarketCloseTime = new Date(currentDateTime);
    currentMarketCloseTime.setHours(15, 30, 0, 0);
    return currentMarketCloseTime;
}

function isWeekend(date: Date) {
    const day = date.getDay();
    return day == 6 || day == 0;
}

async function isNSEHoliday(date: Date) {
    const dateMonthYear = dateMonthYearString(date);
    const response = await fetch(
        `https://api.upstox.com/v2/market/holidays/${dateMonthYear}`
    );

    if (!response.ok) {
        console.log(`Error fetching the NSE holidays.`);
    }

    const json = await response.json();
    return json.data.length > 0;
}

export async function moveToNextDay(dateTime: Date) {
    const isHoliday = isWeekend(dateTime) || (await isNSEHoliday(dateTime));
    const nextDay = new Date(dateTime);
    nextDay.setDate(dateTime.getDate() + 1);
    if (isHoliday) {
        return moveToNextDay(nextDay);
    }

    nextDay.setHours(9, 15);
    return nextDay;
}

/**
 * Checks if the given date's time is greater than 15:29 (3:29 PM)
 * @param date The Date object to check
 * @returns true if the time is greater than 15:29, false otherwise
 */
export function isTimeAfter1529(date: Date): boolean {
    return (
        date.getHours() > 15 ||
        (date.getHours() === 15 && date.getMinutes() >= 29)
    );
}
