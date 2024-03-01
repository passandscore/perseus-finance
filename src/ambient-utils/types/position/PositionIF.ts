export interface PositionIF {
    chainId: string;
    serverPositionId: string;
    positionId: string;
    askTick: number;
    bidTick: number;
    poolIdx: number;
    base: string;
    quote: string;
    baseDecimals: number;
    quoteDecimals: number;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    user: string;
    ensResolution: string;
    baseSymbol: string;
    quoteSymbol: string;
    baseName: string;
    quoteName: string;
    poolPriceInTicks: number;
    isPositionInRange: boolean;
    lowRangeDisplayInBase: string;
    lowRangeShortDisplayInBase: string;
    highRangeDisplayInBase: string;
    highRangeShortDisplayInBase: string;
    lowRangeShortDisplayInQuote: string;
    lowRangeDisplayInQuote: string;
    highRangeDisplayInQuote: string;
    highRangeShortDisplayInQuote: string;
    positionType: string;
    positionLiq: number;
    positionLiqBase: number;
    positionLiqBaseDecimalCorrected: number;
    positionLiqBaseTruncated: string;
    positionLiqQuoteTruncated: string;
    positionLiqQuoteDecimalCorrected: number;
    positionLiqQuote: number;
    feesLiq?: number;
    feesLiqBase?: number;
    feesLiqQuote?: number;
    feesLiqBaseDecimalCorrected?: number;
    feesLiqQuoteDecimalCorrected?: number;
    apy: number;
    timeFirstMint: number;
    latestUpdateTime: number;
    positionLiqTotalUSD: number;
    totalValueUSD: number;
    feesValueUSD: number;
    bidTickPriceDecimalCorrected: number;
    bidTickInvPriceDecimalCorrected: number;
    askTickPriceDecimalCorrected: number;
    askTickInvPriceDecimalCorrected: number;
    source: string;
    lastMintTx: string;
    firstMintTx: string;
    concLiq: number;
    rewardLiq: number;
    ambientLiq: number;
    aprEst: number;
}
