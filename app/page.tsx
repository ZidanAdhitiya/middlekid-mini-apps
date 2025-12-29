"use client";
import { useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import WalletInput from "./components/WalletInput";
import TabNavigation, { TabType } from "./components/TabNavigation";
import PortfolioOverview from "./components/PortfolioOverview";
import TokenList from "./components/TokenList";
import NFTGallery from "./components/NFTGallery";
import type { PortfolioData } from "./lib/types";
import styles from "./page.module.css";

export default function Home() {
  const { context } = useMiniKit();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setError("");
    setPortfolioData(null);
    setActiveTab('overview'); // Reset to overview tab

    try {
      const response = await fetch(`/api/portfolio?address=${address}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio data');
      }

      const data: PortfolioData = await response.json();
      setPortfolioData(data);
    } catch (err) {
      console.error('Portfolio fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Wallet Input Section */}
        <WalletInput onSearch={handleSearch} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Analyzing portfolio...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorContainer}>
            <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={styles.errorTitle}>Error Loading Portfolio</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => setError("")}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Portfolio Data Display with Tabs */}
        {portfolioData && !isLoading && !error && (
          <div className={styles.dashboard}>
            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                tokens: portfolioData.tokens.length,
                nfts: portfolioData.nfts.length,
                transactions: portfolioData.transactions.length,
              }}
            />

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'overview' && (
                <div className={styles.tabPane}>
                  <PortfolioOverview summary={portfolioData.summary} />

                  {/* Wallet Address Display */}
                  <div className={`${styles.addressCard} glass`}>
                    <div className={styles.addressLabel}>Wallet Address</div>
                    <div className={styles.addressValue}>
                      {portfolioData.address}
                    </div>
                    <a
                      href={`https://basescan.org/address/${portfolioData.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.explorerLink}
                    >
                      View on BaseScan
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'tokens' && (
                <div className={styles.tabPane}>
                  <TokenList tokens={portfolioData.tokens} />
                </div>
              )}

              {activeTab === 'nfts' && (
                <div className={styles.tabPane}>
                  {portfolioData.nfts.length > 0 ? (
                    <NFTGallery nfts={portfolioData.nfts} />
                  ) : (
                    <div className={styles.emptyTab}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No NFTs found in this wallet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className={styles.tabPane}>
                  <div className={styles.emptyTab}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Transaction history coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Welcome Message when no data */}
        {!portfolioData && !isLoading && !error && (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className={styles.welcomeTitle}>Welcome to MiddleKid</h2>
            <p className={styles.welcomeText}>
              Enter a wallet address above to analyze your Base chain portfolio
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>💰</div>
                <div className={styles.featureText}>Track Token Holdings</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🖼️</div>
                <div className={styles.featureText}>View NFT Collection</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📊</div>
                <div className={styles.featureText}>Portfolio Analytics</div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>⚡</div>
                <div className={styles.featureText}>Real-time Data</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
