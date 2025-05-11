import { Candle } from "./candlesticks";

/**
 * Big candle is defined as
 * Nifty: candle > 20 pt
 * BankNifty: candle > 40 pt
 * Proper candle is something where the candle strength and candle color is same
 */
export const filterForBigProperCandles = (candles: Candle[]) => {
    return candles.filter((candle) => candle.h - candle.l > 20);
};
