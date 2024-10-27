import { Symbol } from "./types";
import { ApiIndex, Index } from "@/technicals/candlesticks";

function isEnumValue<T extends object>(enumObj: T, value: unknown): value is T[keyof T] {
  return Object.values(enumObj).includes(value as T[keyof T]);
}


export function mapToApiSymbol(symbol: Symbol){
    
    if(!isEnumValue(Index, symbol.name)){
        throw new Error(`Symbol cannot be mapped to an Api symbol`);
    }

    const index = symbol.name as Index; 
    switch(index){
        case Index.BANKNIFTY:
            return ApiIndex.BANKNIFTY
        case Index.NIFTY:
            return ApiIndex.NIFTY
    }
}
