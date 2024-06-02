
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