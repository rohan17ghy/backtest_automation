import puppeteer, { Browser, Page } from "puppeteer";
import { getBNBestStrikeBasedOnFirstCandle } from "./technicals/candlesticks";
import {Symbol} from './technicals/candlesticks';
import { waitForSelectorWithBoolean } from "./selector";

export class BrowserFactory{
    private static _browserInstance: Browser;
    public static async getBrowser(){
        if(!this._browserInstance){
            this._browserInstance = await this.initBrowser();
        }

        return this._browserInstance;
    }

    private static async initBrowser(): Promise<Browser>{
        const browserWSEndpoint = process.env.BROWSER_WEB_SOCKET_DEBUGGER_URL;
        console.log(`Connecting to browser...`);
        const browser = await puppeteer.connect({ browserWSEndpoint, slowMo: 50, defaultViewport: null });
        console.log(`Browser connected`);
        return browser;
    }
}

export class GoCharting{
    private browser!: Browser;
    private timeout!: number;
    
    public static async createInstance(): Promise<GoCharting>{
        const instance = new GoCharting();
        await instance.init();
        return instance
    }

    private async init(): Promise<void> {
        this.browser = await BrowserFactory.getBrowser();
        this.timeout = parseInt(process.env.TIMEOUT ?? "");
    }

    public async navigateToPage(page: Page, symbol: Symbol){
        // Navigate to a webpage
        const url = `https://procharting.in/terminal?ticker=${symbol.name}`;

        console.log(`Navigating to page ${url}`);
        await page.goto(url, { timeout: this.timeout});
        console.log('Reached page');

        await page.waitForSelector('canvas#main', { timeout: this.timeout});
        console.log('Canvas is loaded i.e. Chart is loaded');
    }

    public async navigateToPageWithDate(page: Page, symbol: Symbol, dateTime: Date){
        await this.navigateToPage(page, symbol);

        //TODO: Go to the date time
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
        //await page.waitForSelector('.css-juko39-CloseContainer');
        if(await waitForSelectorWithBoolean(page, '.css-juko39-CloseContainer')){
            await page.click('.css-juko39-CloseContainer');
        }
    }

}

export async function displayBestBNStrike(dateTime: Date){
    const strike = await getBNBestStrikeBasedOnFirstCandle(dateTime);

    const browser = await BrowserFactory.getBrowser();

    const page = await browser.newPage();    
    const goCharting = await GoCharting.createInstance();
    goCharting.navigateToPageWithDate(page, strike.ceStrike, dateTime);
    
    const page2 = await browser.newPage();
    goCharting.navigateToPageWithDate(page2, strike.peStrike, dateTime);
}