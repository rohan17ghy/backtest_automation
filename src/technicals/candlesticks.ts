import puppeteer from "puppeteer";
// import CDP from 'chrome-remote-interface';
import { sleep, Month, dateMonthYearString } from "../datetime/datetime";
import { waitForCanvasUpdate } from "../canvas/canvas";
import { waitForSelectorWithBoolean } from "../selector";
import axios, { AxiosResponse } from 'axios';
import { getBNExpiriesGoCharting } from "../api/api";
import { getBNExpiry } from "./options";

class Candle {
    o: number;
    h: number;
    l: number;
    c: number;
    color: CandleColor;

    constructor(o: number, h: number, l: number, c: number){
        this.o = o;
        this.h = h;
        this.l = l;
        this.c = c;

        this.color = o-c > 0 ? CandleColor.Green : CandleColor.Red;
    }
}

export enum Index{
    BANKNIFTY = "NSE:BANKNIFTY",
    NIFTY = "NSE:NIFTY"
}

export type Symbol = {
    name: Index
}

export enum CandleColor{
    Green = "Green",
    Red = "Red"
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
    
    const browserWSEndpoint = process.env.BROWSER_WEB_SOCKET_DEBUGGER_URL;
    console.log(`Connecting to browser...`);
    const browser = await puppeteer.connect({ browserWSEndpoint, slowMo: 50, defaultViewport: null });    
    console.log(`Browser connected`);

    const timeoutDuration = 90000;
    const page = await browser.newPage();

    // Navigate to a webpage
    await page.goto(`https://procharting.in/terminal?ticker=${symbol.name}`, { timeout: timeoutDuration});

    console.log('Reached page');

    await page.waitForSelector('canvas#main', { timeout: timeoutDuration});
    console.log('Canvas is loaded i.e. Chart is loaded');
    
    //Closing the dismiss button    
    //await page.waitForSelector('#notification-dismiss');
    if(await waitForSelectorWithBoolean(page, '#notification-dismiss')){
        await page.click('#notification-dismiss');
    }  
    
    //Closing the ad
    //await page.waitForSelector('.css-juko39-CloseContainer');
    if(await waitForSelectorWithBoolean(page, '.css-juko39-CloseContainer')){
        await page.click('.css-juko39-CloseContainer');
    }  

    await page.click("#interval-selector-btn");

    //Changing the timeframe
    await page.click('div[title="1 Minute"]');

    //Here we can't track when the canvas has updated completely
    //Since canvas changes don't change the DOM directly
    //So only option left is to keep a delay and 
    await waitForCanvasUpdate(page, "canvas#main");

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

    page.evaluate(() => {
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

    // console.log('Giving a timeout of 5 sec');
    // await sleep(5000);
    await waitForCanvasUpdate(page, "canvas#main");

    await page.waitForSelector('.tooltip-ohlc');
    console.log('OHLC loaded to the assigned date and time');

    const childElements = await page.evaluate(() => {
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

    await sleep(100000)

    return childElements;
}

//We will select a strike where the first candle is not an exception
//The premium should be in my range of 500-800 range
async function getBNBestStrikeBasedOnFirstCandle(dateTime: Date){
    const dateMonthYear = dateMonthYearString(dateTime);
    const expiry = await getBNExpiry(dateMonthYear);
    if(expiry == null){
        throw new Error(`Expiry not found for ${dateTime.toISOString()}`);
    }

    const bnSymbol: Symbol = {
        name: Index.BANKNIFTY
    };

    const bnCandle = get1minCandle(bnSymbol, dateTime);

}

export async function getSingleCandle(symbol: any, interval: number, dateTime: Date){
    
    const data = {
        symbol,
        interval,
        dateTime
    };

    const response = await axios.get(`http://127.0.0.1:19232/candle/singleCandle`,
    {
        data,  // Pass the data object as the data parameter
        headers: {
          'Content-Type': 'application/json',
        },
    });

    return response.data;
}
