export type OptionsMeta = {
    type: string,
    expiry: Date,
    expiryTimestamp: Date,
    strikePrice: number
}

export type OptionsChain = {
    exchange: string,
    segment: string,
    symbol: string,
    name: string,
    optionsMeta: OptionsMeta,
    invalidProp: string
}

export type Symbol = {
    name: string,
    optionsInterval?: number,
    strikesCount?: number
}