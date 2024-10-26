import puppeteer from "puppeteer";
import { sleep, Month, dateMonthYearString } from "@/datetime/datetime";
import { captureCanvasContent, waitForCanvasUpdate } from "@/canvas/canvas";
import { waitForSelectorWithBoolean } from "@/selector";
import axios, { AxiosResponse } from 'axios';
import { getBNExpiriesGoCharting, getBNOptionsData as getBNOptionsChain, getSingleCandle } from "@/api/api";
import { getBNExpiry, buildITMBNOptionStrikes, OptionStrikes, getBNPremiumSymbols } from "@/technicals/options";
import { BrowserFactory, GoCharting } from "@/browser";
import type { Symbol } from "@/types";

export class Candle {
    o: number;
    h: number;
    l: number;
    c: number;
    color: CandleColor;
    dateTime?: Date;

    constructor(o: number, h: number, l: number, c: number, dateTime?: Date){
        this.o = o;
        this.h = h;
        this.l = l;
        this.c = c;
        this.dateTime = dateTime;

        this.color = o-c > 0 ? CandleColor.Green : CandleColor.Red;
    }

    isStrongBullish(){
        const percent = this.calcWickPercent();
        if(0 < percent && percent < 30){
            return true;
        }
    
        return false;
    }
    
    isMediumBullish(){
        const percent = this.calcWickPercent();
        if(30 < percent && percent < 50){
            return true;
        }
    
        return false;
    }
    
    isWeakBullish(){
        const percent = this.calcWickPercent();
        if(percent > 50){
            return true;
        }
    
        return false;
    }
    
    calcWickPercent(){
        const isGreen = this.c - this.o > 0;
    
        if(isGreen){
            return this.calcGreenCandlePercent();
        }else{
            return this.calcGreenCandlePercent();
        }
    }
    
    calcGreenCandlePercent(){
        const percent = (this.h - this.c) / (this.c - this.o);
        return percent;
    }
}

export enum Index{
    BANKNIFTY = "NSE:BANKNIFTY",
    NIFTY = "NSE:NIFTY"
}


export enum CandleColor{
    Green = "Green",
    Red = "Red"
}

export enum Interval {
    Min_1 = 1,
    Min_5 = 5 * Min_1,
    Min_15 = 15 * Min_1,
    Min_30 = 30 * Min_1,
    Hour_1 = 60 * Min_1,
}


export async function get1minCandle(symbol: Symbol, dateTime: Date){
    // const browser = await puppeteer.launch({
    //     args: ['--no-sandbox', '--disable-notifications'],
    //     headless: false,
    //     slowMo: 10,
    //     userDataDir: process.env.USER_DATA_DIR
    // });

    // const browserWSEndpoint = await getBrowserWSEndpoint();
    // console.log(`BrowserWSEndpoint: ${browserWSEndpoint}`);

    const date = dateTime.getDate();
    const month = dateTime.getMonth();
    const year = dateTime.getFullYear();
    const hour = dateTime.getHours();
    const minute = dateTime.getMinutes();    
    
    const browser = await BrowserFactory.getCEBrowser();

    const timeoutDuration = 90000;
    const page = await browser.newPage();

    const goCharting = await GoCharting.createMultipleInstance();

    //Navigate to page with symbol
    await goCharting.navigateToPage(page, symbol);
    
    await goCharting.closeDismissButtonIfPresent(page); 
    
    await goCharting.closeAdIfPresent(page);

    await page.click("#interval-selector-btn");

    //Here we can't track when the canvas has updated completely
    //Since canvas changes don't change the DOM directly
    //So only option left is to keep a delay and 
    await waitForCanvasUpdate(page, async () => {
        //Changing the timeframe
        await page.click('div[title="1 Minute"]');
    });

    //console.log('Giving a timeout of 5 sec');
    //await sleep(5000);

    //Clicking date time picker
    await page.click('#go-to-date-btn');
    await page.waitForSelector('.react-datetime-picker');    
    console.log('DateTime picker loaded');

    //Changing the date
    // await page.click('.react-datetime-picker__calendar-button');  
    // await page.waitForSelector('.react-datetime-picker__calendar--open');
    // await page.waitForSelector(`button > abbr[aria-label="${Month[month]} ${date}, ${year}"]`);
    // const buttonElement = await page.$(`button > abbr[aria-label="${Month[month]} ${date}, ${year}"]`);
    // if (buttonElement) {
    //     console.log(`Found the date button ${JSON.stringify(buttonElement)}`);
    //     var button2May = await buttonElement.click();
    //     console.log(`Button: ${button2May}`);
    // }else{
    //     console.log(`Didn't find the date button`);
    // }

    const inputMonthSelector = `input.react-datetime-picker__inputGroup__month`;
    await page.waitForSelector(inputMonthSelector);
    const inputMonthElement = await page.$(inputMonthSelector);
    inputMonthElement?.type(month.toString());

    const inputDaySelector = `input.react-datetime-picker__inputGroup__day`;
    await page.waitForSelector(inputDaySelector);
    const inputDayElement = await page.$(inputDaySelector);
    inputDayElement?.type(date.toString());

    const inputYearSelector = `input.react-datetime-picker__inputGroup__year`;
    await page.waitForSelector(inputYearSelector);
    const inputYearElement = await page.$(inputYearSelector);
    inputYearElement?.type(year.toString());

    //`react-datetime-picker__inputGroup__month`

    //console.log('Giving a timeout of 5 sec');
    //await sleep(5000);
    //await waitForCanvasUpdate(page, "canvas#main");

    // Changing the hour
    await page.waitForSelector('.react-datetime-picker__inputGroup__hour');
    await page.evaluate((hour) => {
        const inputElement = document.querySelector('.react-datetime-picker__inputGroup__hour') as HTMLInputElement; // Replace with the actual class name
        if(inputElement){
            inputElement.value = `${hour}`; // Replace with the desired new value
        }
    }, hour);

    //Changing the minute
    await page.waitForSelector('.react-datetime-picker__inputGroup__minute'); 
    await page.evaluate((minute) => {
        const inputElement = document.querySelector('.react-datetime-picker__inputGroup__minute') as HTMLInputElement; // Replace with the actual class name
        if(inputElement){
            inputElement.value = `${minute}`; // Replace with the desired new value
        }
    }, minute);

    //Changing am, pm
    await page.waitForSelector('.react-datetime-picker__inputGroup__amPm');
    await page.select('.react-datetime-picker__inputGroup__amPm', 'am');
   
    //console.log('Giving a timeout of 5 sec');
    //await sleep(5000);
    //await waitForCanvasUpdate(page, "canvas#main");

    // console.log('Giving a timeout of 5 sec');
    // await sleep(5000);
    await waitForCanvasUpdate(page, async () => {
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            // Iterate through each button to find the one with text content 'Apply'
            const applyButton = buttons.find(button => button.textContent?.trim() === 'Apply');
            // Click the button if found
            if (applyButton) {
                applyButton.click();
            } else {
                console.log('Button not found.');
            }
        });
    });

    await page.waitForSelector('.tooltip-ohlc');
    console.log('OHLC loaded to the assigned date and time');

    const childElements: any[] = await page.evaluate(() => {
        // Select the parent div using class name
        const parentDiv = document.querySelector('.tooltip-ohlc');
        if (parentDiv) {
            // Use querySelectorAll or getElementsByClassName to get child elements
            const children = parentDiv.children;
            // Convert NodeList to Array and extract text content
            return Array.from(children).map(child => child.textContent);
        } else {
            return []; // Return an empty array if parent div is not found
        }
    });
    
    console.log(`OHLC: ${JSON.stringify(childElements)}`);

    console.log(`Browser: ${JSON.stringify(browser)} Page: ${JSON.stringify(page)}`);

    //await browser.close();
    
    await sleep(10000);
    await page.close();

    return childElements;
}

//We will select a strike where the first candle is not an exception
//The premium should be in my range of 500-800 range
export async function getBNBestStrikeBasedOnFirstCandle(dateTime: Date): Promise<{
    ceStrike: Symbol,
    peStrike: Symbol
}>{
    const dateMonthYear = dateMonthYearString(dateTime);
    console.log(`DateMonthYear: ${dateMonthYear}`);
    const expiry = await getBNExpiry(dateMonthYear);
    if(expiry == null){
        throw new Error(`Expiry not found for ${dateTime.toISOString()}`);
    }

    console.log(`Expiry found: ${expiry}`);

    const bnSymbol: Symbol = {
        name: Index.BANKNIFTY
    };

    //const bnCandle = await get1minCandle(bnSymbol, dateTime);
    const bnCandle = await getSingleCandle("NSE:NIFTYBANK-INDEX", 1, dateTime);
    console.log(`1st min candle: ${JSON.stringify(bnCandle)}`);
    const startingPrice = parseFloat(bnCandle.candles[0][1]);
    const endingPrice = parseFloat(bnCandle.candles[0][4]);

    console.log(`Starting price: ${startingPrice} Ending price ${endingPrice}`);

    const atmPrice = (startingPrice + endingPrice) / 2;

    const optionStrikes = await buildITMBNOptionStrikes(atmPrice, 10);
    console.log(`Option strikes: ${JSON.stringify(optionStrikes)}`);

    const premiumLow = parseInt(process.env.PREMIUM_LOW ?? "");
    const premiumHigh = parseInt(process.env.PREMIUM_HIGH ?? "");
    const bestCEStrike = await bestStrike(optionStrikes.ceStrikes ?? [], dateTime, premiumLow, premiumHigh);
    const bestPEStrike = await bestStrike(optionStrikes.peStrikes ?? [], dateTime, premiumLow, premiumHigh);

    console.log(`BestCEStrike: ${bestCEStrike.name}`);
    console.log(`BestPEStrike: ${bestPEStrike.name}`);
    return { ceStrike: bestCEStrike, peStrike: bestPEStrike};

}

export async function getBNNearITMStrikes(dateTime: Date): Promise<OptionStrikes>{
    const dateMonthYear = dateMonthYearString(dateTime);
    console.log(`DateMonthYear: ${dateMonthYear}`);
    const expiry = await getBNExpiry(dateMonthYear);
    if(expiry == null){
        throw new Error(`Expiry not found for ${dateTime.toISOString()}`);
    }

    console.log(`Expiry found: ${expiry}`);

    const bnSymbol: Symbol = {
        name: Index.BANKNIFTY
    };

    //const bnCandle = await get1minCandle(bnSymbol, dateTime);
    const bnCandle = await getSingleCandle("NSE:NIFTYBANK-INDEX", 1, dateTime);
    console.log(`1st min candle: ${JSON.stringify(bnCandle)}`);
    const openingPrice = parseFloat(bnCandle.candles[0][1]);
    const closingPrice = parseFloat(bnCandle.candles[0][4]);

    console.log(`Opening price: ${openingPrice} Closing price ${closingPrice}`);

    //const atmPrice = (openingPrice + closingPrice) / 2;

    const optionsChain = await getBNOptionsChain(new Date(expiry));
    //console.log(`Options Chain : ${JSON.stringify(optionsChain)}`);

    const optionStrikes = await buildITMBNOptionStrikes(openingPrice, 5);
    console.log(`Option strikes: ${JSON.stringify(optionStrikes)}`);

    const bnSymbols = await getBNPremiumSymbols(optionsChain ?? [], optionStrikes);

    //console.log(`Premium symbols: ${JSON.stringify(bnSymbols)}`);

    // const premiumLow = parseInt(process.env.PREMIUM_LOW ?? "");
    // const premiumHigh = parseInt(process.env.PREMIUM_HIGH ?? "");
    // const bestCEStrike = await bestStrike(optionStrikes.ceStrikes ?? [], dateTime, premiumLow, premiumHigh);
    // const bestPEStrike = await bestStrike(optionStrikes.peStrikes ?? [], dateTime, premiumLow, premiumHigh);

    // console.log(`BestCEStrike: ${bestCEStrike.name}`);
    // console.log(`BestPEStrike: ${bestPEStrike.name}`);
    return bnSymbols;
}

type SymbolWithFirstCandle = {symbol: Symbol, firstCandle: Candle};

async function bestStrike(strikes: string[], dateTime: Date, premiumLow: number, premiumHigh: number){

    const bestStrikes: SymbolWithFirstCandle[] = [];
    for(let strike of strikes){
        const symbol: Symbol = {
            name: `${strike}`,
        }

        const candleArray = await get1minCandle(symbol, dateTime);
        const o = candleArray[1];
        const h = candleArray[3];
        const l = candleArray[5];
        const c = candleArray[7];

        const candle = new Candle(o, h, l, c);

        if(c < premiumLow || c > premiumHigh){
            continue;
        }

        bestStrikes.push({symbol: symbol, firstCandle: candle})
    }

    bestStrikes.sort(bestStrikeComparer);
    return bestStrikes[0].symbol;
}

function bestStrikeComparer(symbolWithFirstCandleA: SymbolWithFirstCandle, symbolWithFirstCandleB: SymbolWithFirstCandle){
    const candleA = symbolWithFirstCandleA.firstCandle;
    const candleB = symbolWithFirstCandleB.firstCandle;
    const candleAPercent = candleA.calcWickPercent();
    const candleBPercent = candleB.calcWickPercent();
    if(candleAPercent < candleBPercent){
        return -1;
    }else if(candleAPercent == candleBPercent){
        return 0;
    }else{
        return 1;
    }
}
