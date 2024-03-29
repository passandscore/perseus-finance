import { useEffect, useState } from 'react';
import { getDefaultTopPools } from '../../ambient-utils/dataLayer';
import { PoolIF } from '../../ambient-utils/types/';

/* Hook to manage the arbitrairly defined top pools for the specific chain.
 * Consumed in sidebar and home page to give the user a convenient way to
 * see which pools they might want to check out. */
export const useTopPools = (chainId: string): PoolIF[] => {
    const [topPools, setTopPools] = useState<PoolIF[]>([]);
    useEffect(() => {
        setTopPools(getDefaultTopPools(chainId));
    }, [chainId]);
    return topPools;
};
