import { GoCharting } from "@/browser";
import { BrowserFactory } from "@/browser";
import { BoundingBox, ElementHandle, Page } from "puppeteer";
import { Candle, Interval } from "./candlesticks";
import { addMinutes, getMarketCloseTime, sleep } from "@/datetime/datetime";
import { Symbol } from "@/types";

export const scrapeOptionsData = async (instrument: string, dateTime: Date, interval: Interval) => {
    const browser = await BrowserFactory.getBrowser();
    const goCharting = await GoCharting.createInstance();

    const page = await BrowserFactory.createPage(browser);
    const symbol: Symbol = {name: instrument};

    await goCharting.navigateToPageWithDate(page, symbol, dateTime);
    console.log(`Chart loaded successfully`);

    let prevTime = new Date(0);
    let currentTime = dateTime;
    let startDay = dateTime.getDay();
    const marketEndTime = getMarketCloseTime(currentTime);

    const resultData: Candle[] = [];
    console.log(`PrevTime: ${prevTime}, CurrentTime: ${currentTime}, MarketEndTime: ${marketEndTime}`);
    while (currentTime > prevTime && currentTime <= marketEndTime){
        //const rawData = await scrapeOHLCData(page, currentTime, interval);
        resultData.push(...await scrapeOHLCData(page, currentTime, interval));

        prevTime = currentTime;
        if(resultData.length > 0){
            currentTime = addMinutes(resultData[resultData.length-1].dateTime as Date, interval);
        }

        await goCharting.scrapeGoToDateTime(page, currentTime);
    }

    console.log(`OHLC: ${JSON.stringify(resultData)}`);
}

const getOHLC = async (page: Page): Promise<number[]> => {
    await page.waitForSelector('.tooltip-ohlc');

    return await page.evaluate(() => {
        // Select the parent div using class name
        const parentDiv = document.querySelector('.tooltip-ohlc');
        if (parentDiv) {
            // Use querySelectorAll or getElementsByClassName to get child elements
            const children = parentDiv.children;
            // Convert NodeList to Array and extract text content
            return Array.from(children).map(child => parseFloat(child.textContent as string));
        } 

        return []
    });
}

const scrapeOHLCData = async (page: Page, dateTime: Date, interval: Interval): Promise<Candle[]> => {
    return new Promise(async (resolve, reject) => {
        const chartElement = await page.$(".gocharting-actual-chart");
        if (!chartElement){
            return reject(new Error("Actual chart element not found"));
        }

        const chartBox = await chartElement.boundingBox() as BoundingBox;

        // Move cursor horizontally across the chart
        // Number of points to sample
        // More number of points gives more accuracy
        const steps = 100; 
        const stepSize = chartBox.width / steps;

        let currentDateTime = dateTime;

        const candles: Candle[] = []
        for (let i = 0; i < steps; i++) {
            const x = chartBox.x + (i * stepSize);
            const y = chartBox.y + (chartBox.height / 2);

            // Move mouse to position
            await page.mouse.move(x, y);

            //await sleep(1000);
            await page.waitForSelector('.tooltip-ohlc');

            const ohlcRaw = await getOHLC(page);

            const currentCandle: Candle = new Candle(ohlcRaw[1], ohlcRaw[3], ohlcRaw[5], ohlcRaw[7], currentDateTime);

            //Check for duplicates.
            //Need to check only with the last element
            if (candles.length == 0){
                candles.push(currentCandle);
                currentDateTime = addMinutes(currentDateTime, interval as number);
            }
            if (candles.length > 0 && !isEqualCandle(candles[candles.length-1], currentCandle)){
                candles.push(currentCandle);
                currentDateTime = addMinutes(currentDateTime, interval as number);
            }

        }

        resolve(candles);
    });    
}


function isEqualCandle(firstCandle: Candle, secondCandle: Candle): boolean {
    return firstCandle.o === secondCandle.o &&
           firstCandle.h === secondCandle.h &&
           firstCandle.l === secondCandle.l &&
           firstCandle.c === secondCandle.c;
}
