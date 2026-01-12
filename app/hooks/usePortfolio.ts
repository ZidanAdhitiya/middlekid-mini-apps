import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UsePortfolioOptions {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
}

export function usePortfolio(address: string | null, options: UsePortfolioOptions = {}) {
    const {
        refreshInterval = 30000, // 30 seconds default
        revalidateOnFocus = true,
        revalidateOnReconnect = true,
    } = options;

    const { data, error, isLoading, mutate } = useSWR(
        address ? `/api/portfolio?address=${address}` : null,
        fetcher,
        {
            refreshInterval,
            revalidateOnFocus,
            revalidateOnReconnect,
            dedupingInterval: 10000, // Prevent duplicate requests within 10s
            errorRetryCount: 3,
            errorRetryInterval: 5000,
        }
    );

    return {
        portfolio: data,
        isLoading,
        isError: error,
        refresh: mutate,
        lastUpdated: data ? new Date() : null,
    };
}
