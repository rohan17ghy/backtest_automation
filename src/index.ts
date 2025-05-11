import { filterForBigProperCandles } from "./technicals/priceAction";
import "dotenv-flow/config";
import CDP from "chrome-remote-interface";
import {
    Index,
    Interval,
    get1minCandle,
    getBNBestStrikeBasedOnFirstCandle,
} from "@/technicals/candlesticks";
import { keepAlive, Month, toISTString } from "@/datetime/datetime";
import { OptionType, buildITMBNOptionStrikes } from "./technicals/options";
import {
    getBNExpiriesGoCharting,
    getSingleCandle,
    getBNSymbolGoCharting,
    getBNOptionsData,
} from "@/api/api";
import {
    displayBestBNStrike,
    displayNearITMBNStrikes,
    displaySinglePremium,
} from "@/browser";
import { scrapeCandleData } from "./technicals/scrapeData";
import type { Symbol } from "@/types";

const main = async () => {
    const symbol: Symbol = {
        name: Index.NIFTY,
        optionsInterval: 50,
        strikesCount: 7,
    };
    const dateTime = new Date(`2025-02-24T09:15:00+05:30`);
    const endTime = new Date(dateTime);
    endTime.setDate(endTime.getDate() + 1);

    //Backtesting
    //console.log(await displayNearITMBNStrikes(symbol, dateTime));

    //Display 1 premium chart along with spot
    //console.log(await displaySinglePremium("BANKNIFTY24SEP53100CE", dateTime));

    //scrape OHLC data
    // const allCandles = await scrapeCandleData(
    //     "NIFTY",
    //     dateTime,
    //     Interval.Min_1,
    //     endTime
    // );
    //const bigCandles = filterForBigProperCandles(allCandles);
    //console.log(`Big candles data: ${JSON.stringify(bigCandles)}`);

    keepAlive();
};

main()
    .then((res: void, rej: void) => {
        console.log(`main method completed. Keeping the nodejs process alive`);
    })
    .catch((err) => {
        console.log(`Error in main fn: ${err.message}`);
    });
