import { getBNExpiriesGoCharting } from "@/api/api";
import { compareDates } from "@/datetime/datetime";
import { Symbol, OptionsChain } from "@/types";

export enum OptionType {
    CE = "CE",
    PE = "PE"
}

export type OptionStrikes = {
    ceStrikes?: string[],
    peStrikes?: string[]
}

export async function getBNExpiry(symbol: Symbol, dateTime: string): Promise<string | null>{
    const expiries: string[] = await getBNExpiriesGoCharting(symbol);

    if(expiries.length <= 0){
        throw new Error(`No expiry found`);
    }

    //sorting in descending order
    expiries.sort((a, b) => b.localeCompare(a));

    console.log(`Expiries: ${expiries}`);

    //Binary search can be used here instead of linear search
    let prevExpiry = expiries[0];
    for (let expiry of expiries){
        const compareResult = compareDates(expiry, dateTime)
        if(compareResult < 0){
            return prevExpiry;
        }else if(compareResult == 0){
            return expiry;
        }

        prevExpiry = expiry;
    }

    return null;
}

// Overload signatures
export async function buildITMBNOptionStrikes(symbol: Symbol, atmPrice: number, noOfStrikes: number): Promise<OptionStrikes>;
export async function buildITMBNOptionStrikes(symbol: Symbol, ceStartPrice: number, peStartPrice: number, noOfStrikes: number): Promise<OptionStrikes>;

// Single implementation
export async function buildITMBNOptionStrikes(symbol: Symbol, arg1: number, arg2: number, arg3?: number): Promise<OptionStrikes> {
    let ceStrikes: number[];
    let peStrikes: number[];

    if (typeof arg3 === 'number') {
        // Overload with ceStartPrice, peStartPrice, noOfStrikes
        ceStrikes = itmStrikes(symbol, OptionType.CE, arg1, arg3);
        peStrikes = itmStrikes(symbol, OptionType.PE, arg2, arg3);
    } else {
        // Overload with atmPrice, noOfStrikes
        ceStrikes = itmStrikes(symbol, OptionType.CE, arg1, arg2);
        peStrikes = itmStrikes(symbol, OptionType.PE, arg1, arg2);
    }

    return {
        ceStrikes: ceStrikes.map(strike => `${strike}${OptionType.CE}`),
        peStrikes: peStrikes.map(strike => `${strike}${OptionType.PE}`)
    };
}

function itmStrikes(symbol: Symbol, optionType: OptionType, price: number, noOfStrikes: number): number[]{
    const optionsInterval = symbol.optionsInterval as number;
    const firstStrike = optionType == OptionType.CE  ? Math.ceil(price/optionsInterval) * optionsInterval
                                                     : Math.floor(price/optionsInterval) * optionsInterval;

    console.log(`Opening price inside itmStrikes() is: ${price}, FirstStrike: ${firstStrike}, OptionType: ${optionType}`);
    const strikes: number[] = [firstStrike];
    let currentPrice = firstStrike;
    for(let i=0; i < noOfStrikes; i++){
        const nextStrike = nextBNITMStrike(symbol, currentPrice, optionType);
        console.log(`Next Strike: ${nextStrike}`);
        strikes.push(nextStrike);
        currentPrice = nextStrike;
    }
    console.log(`Strikes: ${strikes}`);
    return strikes;
}

function nextBNITMStrike(symbol: Symbol, price: number, optionType: OptionType){
    const optionsInterval = symbol.optionsInterval as number;
    const factor = optionType == OptionType.CE ? -1 : 1;
    return (Math.trunc(price / optionsInterval) + factor) * optionsInterval;
}

export function getBNPremiumSymbols(optionChain: OptionsChain[], optionStrikes: OptionStrikes): OptionStrikes{
    const ceStrikes = optionStrikes.ceStrikes?.map(strike => {
        const option = optionChain.find(option => option.symbol.slice(-7) == strike);
        
        //console.log(`Option Found: ${JSON.stringify(option)}`);
        return option?.symbol;
    }) as string[];

    const peStrikes = optionStrikes.peStrikes?.map(strike => {
        const option = optionChain.find(option => option.symbol.slice(-7) == strike);

        //console.log(`Option Found: ${JSON.stringify(option)}`);        
        return option?.symbol;
    }) as string[];

    return { ceStrikes, peStrikes };
}

