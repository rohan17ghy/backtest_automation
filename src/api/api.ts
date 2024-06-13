import axios, { AxiosResponse } from 'axios';
import { OptionType } from '@/technicals/options';
import { dateMonthYearString } from '@/datetime/datetime';
import {OptionsChain} from '@/types';

export const HTTPStatus = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

export async function getBNExpiriesGoCharting(){
    try{
        const result  = await axios.get(`https://procharting.in/api/instruments/search/expiries?q=NSE:OPTIONS:BANKNIFTY`,
        {
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if(result.status != HTTPStatus.OK){
            throw new Error(`Error fetching BankNifty expiries Status: ${result.status}`);
        }

        return result.data?.payload?.expiry;
    }
    catch(err){
        console.log(`${err}`);
    }
}

export async function getBNSymbolGoCharting(strikePrice: number, optionType: OptionType, expiry: string){
    try{
        const result  = await axios.get(`https://procharting.in/api/instruments/search_at_expiry?q=NSE:OPTIONS:BANKNIFTY:${expiry}`,
        {
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if(result.status != HTTPStatus.OK){
            throw new Error(`Error fetching BankNifty symbol Status: ${result.status}`);
        }

        const resultArr: any[] = result.data?.payload
        ?.filter((st: any) => st.options_meta?.strike_price == strikePrice && st.symbol.endsWith(optionType));

        return resultArr.length > 0 ? resultArr[0].symbol : "";
    }
    catch(err){
        console.log(`${err}`);
    }
}

export async function getBNOptionsData(expiry: Date): Promise<OptionsChain[] | null>{
    try{
        const result = await axios.get(`https://procharting.in/api/instruments/search_at_expiry?q=NSE:OPTIONS:BANKNIFTY:${dateMonthYearString(expiry)}`,
        {
            headers: {
            'Content-Type': 'application/json',
            },
        });

        const optionsChain: OptionsChain[] = result.data.payload;
        
        return optionsChain
        //console.log(`Option Chain: ${optionChain[0].exchange}, ${optionChain[0].invalidProp}, ${optionChain[0].name}`);
    }
    catch(err){
        console.log(`Error getting BN Options Data${err}`);
        return null;
    }

    
}

export async function getSingleCandle(symbol: any, interval: number, dateTime: Date){
    
    const data = {
        symbol,
        interval,
        dateTime
    };

    const response = await axios.get(`http://127.0.0.1:19232/candle/singleCandle`,
    {
        data,  // Pass the data object as the data parameter
        headers: {
          'Content-Type': 'application/json',
        },
    });

    return response.data;
}
