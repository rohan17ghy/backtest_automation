
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
    December
}

export function dateMonthYearString(dateTime: Date){
    return dateTime.toISOString().split('T')[0];
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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