import 'dotenv-flow/config';
import CDP from 'chrome-remote-interface';
import { Index, Interval, get1minCandle, getBNBestStrikeBasedOnFirstCandle } from "@/technicals/candlesticks";
import { keepAlive, Month } from "@/datetime/datetime";
import { OptionType, buildITMBNOptionStrikes } from './technicals/options';
import { getBNExpiriesGoCharting, getSingleCandle, getBNSymbolGoCharting, getBNOptionsData } from '@/api/api';
import { displayBestBNStrike, displayNearITMBNStrikes, displaySinglePremium } from '@/browser';
import { scrapeOptionsData } from './technicals/scrapeData';
import type { Symbol } from '@/types';


const main  = async () => {
    const symbol: Symbol = {
        name: Index.BANKNIFTY
    }
    const dateTime = new Date(`2024-10-23T09:15:00+05:30`);

    //Backtesting
    console.log(await displayNearITMBNStrikes(dateTime));

    //Display 1 premium chart along with spot
    //console.log(await displaySinglePremium("BANKNIFTY24SEP53100CE", dateTime));

    //scrape OHLC data
    //console.log(await scrapeOptionsData("BANKNIFTY24JUL50600CE", dateTime, Interval.Min_1))

    keepAlive();
}

main()
.then((res: void, rej: void) => {
    console.log(`main method completed. Keeping the nodejs process alive`);
})
.catch(err => {
    console.log(`Error in main fn: ${err.message}`);
});
