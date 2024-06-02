import { getBNExpiriesGoCharting } from "../api/api";

export enum OptionType {
    CE = "CE",
    PE = "PE"
}

type OptionStrikes = {
    ceStrikes?: number[],
    peStrikes?: number[]
}

export async function getBNExpiry(dateTime: string): Promise<string | null>{
    const expiries: string[] = await getBNExpiriesGoCharting();

    if(expiries.length <= 0){
        throw new Error(`No expiry found`);
    }

    expiries.sort();

    //Binary search can be used here instead of linear search
    expiries.forEach(element => {
        if(dateTime > element){
            return element;
        }
    });

    return null;
}

export async function getITMBNOptionStrikes(atmPrice: number, noOfStrikes: number): Promise<OptionStrikes>{
    const ceStrikes = itmStrikes(OptionType.CE, atmPrice, noOfStrikes);
    const peStrikes = itmStrikes(OptionType.PE, atmPrice, noOfStrikes);

    return {
        ceStrikes,
        peStrikes
    }
}

function itmStrikes(optionType: OptionType, price: number, noOfStrikes: number): number[]{
    let strikes: number[] = [Math.trunc(price/100) * 100];
    let currentPrice = price;
    for(let i=0; i < noOfStrikes; i++){
        const nextStrike = nextBNITMStrike(currentPrice, optionType);
        console.log(`Next Strike: ${nextStrike}`);
        strikes.push(nextStrike);
        currentPrice = nextStrike;
    }
    console.log(`Strikes: ${strikes}`);
    return strikes;
}

function nextBNITMStrike(price: number, optionType: OptionType){
    const factor = optionType == OptionType.CE ? -1 : 1;
    return (Math.trunc(price / 100) + factor) * 100;
}

