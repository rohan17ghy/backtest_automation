import puppeteer, { Browser, Page } from "puppeteer";
import { getBNBestStrikeBasedOnFirstCandle, getBNNearITMStrikes } from "./technicals/candlesticks";
import {Symbol} from './types';
import { waitForSelectorWithBoolean } from "./selector";
import { captureCanvasContent, waitForCanvasUpdate } from "./canvas/canvas";
import { sleep } from "./datetime/datetime";

export class BrowserFactory{
    private static _ceBrowserInstance: Browser | null;
    private static _cePages: Page[];
    private static _peBrowserInstance: Browser | null;
    private static _pePages: Page[];
    public static async getCEBrowser(){
        if(!this._ceBrowserInstance){
            this._ceBrowserInstance = await this.initBrowser();
            this._cePages = [];
        }

        return this._ceBrowserInstance;
    }

    public static async getPEBrowser(){
        if(!this._peBrowserInstance){
            this._peBrowserInstance = await this.initBrowser();
            this._pePages = [];
        }

        return this._peBrowserInstance;
    }

    private static async initBrowser(): Promise<Browser>{
        const browserWSEndpoint = process.env.BROWSER_WEB_SOCKET_DEBUGGER_URL;
        console.log(`Connecting to browser with URL ${process.env.BROWSER_WEB_SOCKET_DEBUGGER_URL}`);
        //const browser = await puppeteer.connect({ browserWSEndpoint, slowMo: 50, defaultViewport: null });
        console.log(process.env.EDGE_PATH);
        const browser = await puppeteer.launch({
            executablePath: process.env.EDGE_PATH,
            slowMo: 15, 
            defaultViewport: null, 
            headless: false,
            args: [
                '--start-maximized', // Argument to start the browser in fullscreen mode
                `--force-device-scale-factor=${process.env.ZOOM || 1}`
            ]
        });
        console.log(`Browser connected`);
        return browser;
    }

    public static async createPage(browser: Browser): Promise<Page>{
        return await browser.newPage();
    }

    public static async closeBrowser(){
        await BrowserFactory._ceBrowserInstance?.close();
        BrowserFactory._ceBrowserInstance = null;
        await BrowserFactory._peBrowserInstance?.close();
        BrowserFactory._peBrowserInstance = null;
    }
}

export class GoCharting{
    public ceBrowser!: Browser;
    public peBrowser!: Browser;
    private timeout!: number;
    
    public static async createInstance(): Promise<GoCharting>{
        const instance = new GoCharting();
        await instance.init();
        return instance
    }

    private async init(): Promise<void> {
        this.ceBrowser = await BrowserFactory.getCEBrowser();
        const ceSpotPage = await BrowserFactory.createPage(this.ceBrowser);
        await this.navigateToPage(ceSpotPage, {name: "BANKNIFTY"});
        await this.applyTheme(ceSpotPage);

        this.peBrowser = await BrowserFactory.getPEBrowser();
        const peSpotPage = await BrowserFactory.createPage(this.peBrowser);
        await this.navigateToPage(peSpotPage, {name: "BANKNIFTY"});
        await this.applyTheme(peSpotPage);

        this.timeout = parseInt(process.env.TIMEOUT ?? "");
    }

    public async dispose(){
        await BrowserFactory.closeBrowser();
    }

    public async navigateToPage(page: Page, symbol: Symbol){
        // Navigate to a webpage
        const url = `https://procharting.in/terminal?ticker=NSE:${symbol.name}`;

        console.log(`Navigating to page ${url}`);
        await page.goto(url, { timeout: this.timeout});
        console.log('Reached page');

        await page.waitForSelector('canvas#main', { timeout: this.timeout});
        console.log('Canvas is loaded i.e. Chart is loaded');
    }

    public async navigateToPageWithDate(page: Page, symbol: Symbol, dateTime: Date){
        await this.navigateToPage(page, symbol);

        //TODO: Go to the date time
        await this.goToDateTime(page, dateTime);
    }

    public async applyTheme(page: Page){
        //Dark Mode
        if (process.env.DARK_MODE == "true"){ 
            await page.waitForSelector('.css-1urc7jq-Button-StyledTopBarButton-StyledRibbonButton');
            await page.click('.css-1urc7jq-Button-StyledTopBarButton-StyledRibbonButton');

            const swatchSelector = '.css-9a3oj9-Swatch';
            await page.waitForSelector(swatchSelector);
            await page.click(swatchSelector);

            const bgColorPickerSelector = '.sketch-picker > .flexbox-fix:nth-child(3) > div:first-child > div:first-child > input';
            await page.waitForSelector(bgColorPickerSelector);
            const inputBgColorElement = await page.$(bgColorPickerSelector);
            console.log(`Background color picker selector loaded`);
            if (inputBgColorElement) {
                await inputBgColorElement.click({count: 3});
                await inputBgColorElement.press('Backspace');
                await inputBgColorElement.type('1A1A19'); // Replace with the value you want to type
            }

            // Use $eval to get the last element with the class
            const gridLinesHandle = await page.evaluateHandle(selector => {
                const elements = document.querySelectorAll(selector);
                return elements[elements.length - 1];
            }, swatchSelector);

            await gridLinesHandle.click();

            console.log('Gridline options loaded');
            

            const gridLinesSelector = '.sketch-picker > .flexbox-fix:nth-child(3) > div:first-child > div:first-child > input';

            
            //This waitForSelector might not work properly because `gridLineSelector` and `bgColorPickerSelector` are same.
            //Due to this waitForSelector might not actually wait for gridLinesSelector instead wait for bgColorPickerSelector and exit.
            await sleep(2000);
            await page.waitForSelector(gridLinesSelector);


            const inputGridLinesElement = await page.$(gridLinesSelector);
            console.log(`Gridlines color picker selector loaded`);
            if (inputGridLinesElement) {
                await inputGridLinesElement.click({count: 3});
                await inputGridLinesElement.press('Backspace');
                await inputGridLinesElement.type('F2F4F6'); // Replace with the value you want to type
            }

            const opacitySelector = '.sketch-picker > .flexbox-fix:nth-child(3) > div:last-child > div:first-child > input';
            await page.waitForSelector(opacitySelector);
            const opacityElement = await page.$(opacitySelector);
            if(opacityElement){
                await opacityElement.click({count: 3});
                await opacityElement.press('Backspace');
                await opacityElement.type('8');
            }

            await page.waitForSelector('.css-jihlgb-Altspan:last-of-type');
            await page.click('.css-jihlgb-Altspan:last-of-type');
        }
    }

    public async closeDismissButtonIfPresent(page: Page){
        //Closing the dismiss button
        //await page.waitForSelector('#notification-dismiss');
        if(await waitForSelectorWithBoolean(page, '#notification-dismiss')){
            await page.click('#notification-dismiss');
        }
    }

    public async closeAdIfPresent(page: Page){
        //Closing the ad
        //Type 1 ad
        if(await waitForSelectorWithBoolean(page, '.css-nnw530-CloseContainer')){
            await page.click('.css-nnw530-CloseContainer');
        }

        //Closing the ad
        //Type 2 ad
        if(await waitForSelectorWithBoolean(page, '.css-juko39-CloseContainer')){
            await page.click('.css-juko39-CloseContainer');
        }
    }

    public async goToDateTime(page: Page, dateTime: Date){
        const date = dateTime.getDate();
        const month = dateTime.getMonth() + 1; // Months have zero based index
        const year = dateTime.getFullYear();
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();

        console.log(`Navigating to ${date}/${month}/${year} ${hour}:${minute}, DateTime: ${dateTime}`);

        //TODO: Go to the date time
        await this.closeDismissButtonIfPresent(page);
    
        await this.closeAdIfPresent(page);

        await page.click("#interval-selector-btn");
        
        //Here we can't track when the canvas has updated completely
        //Since canvas changes don't change the DOM directly
        //So only option left is to keep a delay and track the canvas changes
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
        //await sleep(15000);
        //console.log(`Hour: ${hour}, Minute: ${minute}`);

        // Changing the hour
        const inputHourSelector = '.react-datetime-picker__inputGroup__hour';
        await page.waitForSelector(inputHourSelector);
        const inputHourElement = await page.$(inputHourSelector);
        inputHourElement?.type(hour.toString());

        //Changing the minute
        const inputMinuteSelector = '.react-datetime-picker__inputGroup__minute'
        await page.waitForSelector(inputMinuteSelector);
        const inputMinuteElement = await page.$(inputMinuteSelector);
        inputMinuteElement?.type(minute.toString());

        //await sleep(15000);

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
    }

    public async getOHLC(page: Page){
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

        return childElements;
    }

    public async displayStrikes(browser: Browser, strikes: string[], dateTime: Date){
        for (const strike of strikes){
            const page = await BrowserFactory.createPage(browser);
            await this.navigateToPageWithDate(page, {name: strike}, dateTime);
        }
    }

}

export async function displayBestBNStrike(dateTime: Date){
    const strike = await getBNBestStrikeBasedOnFirstCandle(dateTime);

    const browser = await BrowserFactory.getCEBrowser();

    const page = await browser.newPage();
    const goCharting = await GoCharting.createInstance();
    goCharting.navigateToPageWithDate(page, strike.ceStrike, dateTime);
    
    const page2 = await browser.newPage();
    goCharting.navigateToPageWithDate(page2, strike.peStrike, dateTime);
}

export async function displayNearITMBNStrikes(dateTime: Date){
    const strikes = await getBNNearITMStrikes(dateTime);

    // const browser = await BrowserFactory.getCEBrowser();
    // const page = await browser.newPage();
    const goCharting = await GoCharting.createInstance();

    console.log(`Datetime at displayNearITMBNStrikes: ${dateTime}`);
    // await goCharting.navigateToPageWithDate(page, strikes.ceStrikes ? {name: strikes.ceStrikes[0]} : {name: ""}, dateTime);
    // await goCharting.getOHLC(page);
    await goCharting.displayStrikes(goCharting.ceBrowser, strikes.ceStrikes as string[], dateTime);
    await goCharting.displayStrikes(goCharting.peBrowser, strikes.peStrikes as string[], dateTime);
}