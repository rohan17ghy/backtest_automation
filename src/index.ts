import 'dotenv-flow/config';
import CDP from 'chrome-remote-interface';
import { Index, get1minCandle, getBNBestStrikeBasedOnFirstCandle } from "@/technicals/candlesticks";
import { keepAlive, Month } from "@/datetime/datetime";
import { OptionType, buildITMBNOptionStrikes } from './technicals/options';
import { getBNExpiriesGoCharting, getSingleCandle, getBNSymbolGoCharting, getBNOptionsData } from '@/api/api';
import { displayBestBNStrike, displayNearITMBNStrikes } from '@/browser';
import type { Symbol } from '@/types';


const main  = async () => {
    const symbol: Symbol = {
        name: Index.BANKNIFTY
    }
    const dateTime = new Date(`2024-07-05T09:15:00+05:30`);
    console.log(await displayNearITMBNStrikes(dateTime));

    keepAlive();
    // console.log(`${getBNOptionsData(dateTime)}`);
    //console.log(`${JSON.stringify(await displayBestBNStrike(dateTime))}`);
    //console.log(`First candle: ${JSON.stringify(await getSingleCandle("NSE:NIFTY50-INDEX", 1, new Date("2024-05-24T09:15:00+05:30")))}`);
    //console.log(`BankNifty Option Strikes: ${JSON.stringify(await getITMBNOptionStrikes(43476, 10))}`);
    //console.log(`BankNifty Expiries: ${JSON.stringify(await getBNExpiries())}`);
    //console.log(`BankNifty Symbol: ${JSON.stringify(await getBNSymbol(47500, OptionType.CE, "2024-05-22"))}`);

}

main()
.then((res: void, rej: void) => {
    console.log(`main method completed. Keeping the nodejs process alive`);
})
.catch(err => {
    console.log(`Error in main fn: ${err.message}`);
});
