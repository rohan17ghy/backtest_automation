import 'dotenv-flow/config';
import CDP from 'chrome-remote-interface';
import { Index, get1minCandle, getBNBestStrikeBasedOnFirstCandle } from "@/technicals/candlesticks";
import { keepAlive, Month } from "@/datetime/datetime";
import { OptionType, buildITMBNOptionStrikes } from './technicals/options';
import { getBNExpiriesGoCharting, getSingleCandle, getBNSymbolGoCharting, getBNOptionsData } from '@/api/api';
import { displayBestBNStrike, displayNearITMBNStrikes, displayBNPremium as displaySinglePremium } from '@/browser';
import type { Symbol } from '@/types';


const main  = async () => {
    const symbol: Symbol = {
        name: Index.BANKNIFTY
    }
    const dateTime = new Date(`2024-09-20T09:15:00+05:30`);

    //Backtesting
    //console.log(await displayNearITMBNStrikes(dateTime));

    //Display 1 premium chart along with spot
    console.log(await displaySinglePremium("BANKNIFTY24SEP53100CE", dateTime));

    keepAlive();
}

main()
.then((res: void, rej: void) => {
    console.log(`main method completed. Keeping the nodejs process alive`);
})
.catch(err => {
    console.log(`Error in main fn: ${err.message}`);
});
