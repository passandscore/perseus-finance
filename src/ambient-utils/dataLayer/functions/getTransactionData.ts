import { CrocEnv, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { TokenIF, TransactionIF, TransactionServerIF } from '../../types';
import { FetchAddrFn, FetchContractDetailsFn, TokenPriceFn } from '../../api';
import { SpotPriceFn } from './querySpotPrice';
import { Provider } from '@ethersproject/providers';

export const getTransactionData = async (
    tx: TransactionServerIF,
    tokenList: TokenIF[],
    crocEnv: CrocEnv,
    provider: Provider,
    chainId: string,
    lastBlockNumber: number,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    cachedEnsResolve: FetchAddrFn,
    skipENSFetch?: boolean,
): Promise<TransactionIF> => {
    const newTx = { ...tx } as TransactionIF;

    const baseTokenAddress = tx.base.length === 40 ? '0x' + tx.base : tx.base;
    const quoteTokenAddress =
        tx.quote.length === 40 ? '0x' + tx.quote : tx.quote;

    // Fire off network queries async simultaneous up-front
    const poolPriceNonDisplay = cachedQuerySpotPrice(
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
        lastBlockNumber,
    );

    const baseMetadata = cachedTokenDetails(provider, tx.base, chainId);
    const quoteMetadata = cachedTokenDetails(provider, tx.quote, chainId);

    const basePricePromise = cachedFetchTokenPrice(
        baseTokenAddress,
        chainId,
        crocEnv,
    );
    const quotePricePromise = cachedFetchTokenPrice(
        quoteTokenAddress,
        chainId,
        crocEnv,
    );

    newTx.ensResolution = skipENSFetch
        ? ''
        : (await cachedEnsResolve(tx.user)) ?? '';

    const baseTokenName = tokenList.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.name;
    const quoteTokenName = tokenList.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.name;

    const baseTokenLogoURI = tokenList.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokenList.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    newTx.baseName = baseTokenName ?? '';
    newTx.quoteName = quoteTokenName ?? '';

    newTx.baseTokenLogoURI = baseTokenLogoURI ?? '';
    newTx.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    const DEFAULT_DECIMALS = 18;
    const baseTokenDecimals =
        (await baseMetadata)?.decimals ?? DEFAULT_DECIMALS;
    const quoteTokenDecimals =
        (await quoteMetadata)?.decimals ?? DEFAULT_DECIMALS;

    newTx.baseDecimals = baseTokenDecimals;
    newTx.quoteDecimals = quoteTokenDecimals;

    newTx.baseSymbol = (await baseMetadata)?.symbol ?? '';
    newTx.quoteSymbol = (await quoteMetadata)?.symbol ?? '';

    newTx.baseFlowDecimalCorrected =
        tx.baseFlow / Math.pow(10, baseTokenDecimals);
    newTx.quoteFlowDecimalCorrected =
        tx.quoteFlow / Math.pow(10, quoteTokenDecimals);

    const lowerPriceNonDisplay = tickToPrice(tx.bidTick);
    const upperPriceNonDisplay = tickToPrice(tx.askTick);

    const lowerPriceDisplayInBase =
        1 /
        toDisplayPrice(
            upperPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

    const upperPriceDisplayInBase =
        1 /
        toDisplayPrice(
            lowerPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

    const lowerPriceDisplayInQuote = toDisplayPrice(
        lowerPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const upperPriceDisplayInQuote = toDisplayPrice(
        upperPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    newTx.bidTickPriceDecimalCorrected = lowerPriceDisplayInQuote;
    newTx.bidTickInvPriceDecimalCorrected = lowerPriceDisplayInBase;
    newTx.askTickPriceDecimalCorrected = upperPriceDisplayInQuote;
    newTx.askTickInvPriceDecimalCorrected = upperPriceDisplayInBase;

    newTx.limitPrice = newTx.isBuy
        ? tickToPrice(newTx.bidTick)
        : tickToPrice(newTx.askTick);
    newTx.limitPriceDecimalCorrected = toDisplayPrice(
        newTx.limitPrice,
        baseTokenDecimals,
        quoteTokenDecimals,
    );
    newTx.invLimitPriceDecimalCorrected = 1 / newTx.limitPriceDecimalCorrected;

    newTx.swapPrice = Math.abs(newTx.baseFlow / newTx.quoteFlow);
    newTx.swapPriceDecimalCorrected = Math.abs(
        newTx.baseFlowDecimalCorrected / newTx.quoteFlowDecimalCorrected,
    );
    newTx.swapInvPriceDecimalCorrected = 1 / newTx.swapPriceDecimalCorrected;

    const basePrice = await basePricePromise;
    const quotePrice = await quotePricePromise;
    const poolPrice = toDisplayPrice(
        await poolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    if (quotePrice && basePrice) {
        newTx.totalValueUSD =
            basePrice.usdPrice * Math.abs(newTx.baseFlowDecimalCorrected) +
            quotePrice.usdPrice * Math.abs(newTx.quoteFlowDecimalCorrected);
    } else if (basePrice) {
        const quotePrice = basePrice.usdPrice * poolPrice;
        newTx.totalValueUSD =
            quotePrice * Math.abs(newTx.quoteFlowDecimalCorrected) +
            basePrice.usdPrice * Math.abs(newTx.baseFlowDecimalCorrected);
    } else if (quotePrice) {
        const basePrice = quotePrice.usdPrice / poolPrice;
        newTx.totalValueUSD =
            basePrice * Math.abs(newTx.baseFlowDecimalCorrected) +
            quotePrice.usdPrice * Math.abs(newTx.quoteFlowDecimalCorrected);
    } else {
        newTx.totalValueUSD = 0.0;
    }

    const isBilateral = newTx.changeType === 'swap';
    if (isBilateral) {
        newTx.totalValueUSD = newTx.totalValueUSD / 2.0;
    }

    return newTx;
};
