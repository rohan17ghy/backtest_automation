import 'dotenv-flow/config';
import CDP from 'chrome-remote-interface';
import { Symbol, Index, get1minCandle, getSingleCandle } from "./technicals/candlesticks";
import { Month } from "./datetime/datetime";
import { OptionType, getITMBNOptionStrikes } from './technicals/options';
import { getBNExpiriesGoCharting, getBNSymbolGoCharting } from './api/api';


const main  = async () => {
    const symbol: Symbol = {
        name: Index.BANKNIFTY
    }
    const dateTime = new Date(`2024-05-06T09:15:00+05:30`); 
    console.log(`${JSON.stringify(await get1minCandle(symbol, dateTime))}`);
    //console.log(`First candle: ${JSON.stringify(await getSingleCandle("NSE:NIFTY50-INDEX", 1, new Date("2024-05-24T09:15:00+05:30")))}`);
    //console.log(`BankNifty Option Strikes: ${JSON.stringify(await getITMBNOptionStrikes(43476, 10))}`);
    //console.log(`BankNifty Expiries: ${JSON.stringify(await getBNExpiries())}`);
    //console.log(`BankNifty Symbol: ${JSON.stringify(await getBNSymbol(47500, OptionType.CE, "2024-05-22"))}`);

}

main()
.then((res: void, rej: void) => {
    console.log(`main method completed with Resolve: ${res}, Reject: ${rej}`);
})
.catch(err => {
    console.log(`Error in main fn: ${JSON.stringify(err)}`);
});
