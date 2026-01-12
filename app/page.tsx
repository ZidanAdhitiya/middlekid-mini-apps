"use client";
import { useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import WalletInput from "./components/WalletInput";
import TabNavigation, { TabType } from "./components/TabNavigation";
import PortfolioOverview from "./components/PortfolioOverview";
import TokenList from "./components/TokenList";
import NFTGallery from "./components/NFTGallery";
import ActivityFeed from "./components/ActivityFeed";
import DeFiPositions from "./components/DeFiPositions";
import PortfolioInsights from "./components/PortfolioInsights";
import type { PortfolioData } from "./lib/types";
import styles from "./page.module.css";

export default function Home() {
  const { context } = useMiniKit();
  const { address: connectedAddress, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleAnalyzeWallet = () => {
    if (isConnected && connectedAddress) {
      handleSearch(connectedAddress);
    } else {
      open();
    }
  };

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setError("");
    setPortfolioData(null);
    setActiveTab('overview'); // Reset to overview tab

    try {
      console.log("Fetching portfolio data for:", address);
      const response = await fetch(`/api/portfolio?address=${address}`);
      const data = await response.json();
      console.log("Portfolio Data Received:", data);

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to fetch portfolio data');
      }

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
            {/* Insights Section */}
            <PortfolioInsights insights={portfolioData.insights} errors={portfolioData.errors} />

            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                tokens: portfolioData.tokens.length,
                nfts: portfolioData.nfts.length,
                transactions: portfolioData.transactions.length,
                defi: portfolioData.stakingPositions.length,
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
                  <ActivityFeed transactions={portfolioData.transactions} />
                </div>
              )}

              {activeTab === 'defi' && (
                <div className={styles.tabPane}>
                  <DeFiPositions positions={portfolioData.stakingPositions} />
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '12px' }}>
              v1.2 Real Mode (Port: {typeof window !== 'undefined' ? window.location.port : '...'})
              {(portfolioData as any).debug && (
                <pre style={{ textAlign: 'left', background: '#222', padding: '10px', marginTop: '10px', overflow: 'auto' }}>
                  DEBUG INFO:
                  {JSON.stringify((portfolioData as any).debug, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Welcome Message when no data */}
        {!portfolioData && !isLoading && !error && (
          <div className={styles.welcome}>
            <div className={styles.welcomeContent}>
              <h2 className={styles.welcomeTitle}>
                <span className={styles.welcomeEmoji}>👋</span>
                Welcome to MiddleKid
              </h2>
              <p className={styles.welcomeSubtitle}>
                Your intelligent Web3 portfolio companion
              </p>
              <p className={styles.welcomeText}>
                Enter any wallet address above to discover holdings, track DeFi positions,
                and analyze on-chain activity across multiple networks.
              </p>

              <button
                className={styles.analyzeButton}
                onClick={handleAnalyzeWallet}
              >
                {isConnected ? '🔍 Analyze your wallet' : '🔗 Connect Wallet to Start'}
              </button>
            </div>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <div className={styles.featureTitle}>Portfolio Analytics</div>
                <div className={styles.featureDesc}>Track tokens, NFTs & DeFi positions in real-time</div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⛓️</div>
                <div className={styles.featureTitle}>Multi-Chain Support</div>
                <div className={styles.featureDesc}>Ethereum, Base, Arbitrum, Optimism & more</div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💎</div>
                <div className={styles.featureTitle}>DeFi Detection</div>
                <div className={styles.featureDesc}>Aave, Lido, Curve, ether.fi, Kinetiq & more</div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔍</div>
                <div className={styles.featureTitle}>Deep Insights</div>
                <div className={styles.featureDesc}>Discover hidden value in your wallet</div>
              </div>
            </div>

            <div className={styles.supportedProtocols}>
              <span className={styles.protocolsLabel}>Supported Protocols:</span>
              <div className={styles.protocolTags}>
                <span className={styles.protocolTag}>Aave</span>
                <span className={styles.protocolTag}>Lido</span>
                <span className={styles.protocolTag}>Curve</span>
                <span className={styles.protocolTag}>ether.fi</span>
                <span className={styles.protocolTag}>Kinetiq</span>
                <span className={styles.protocolTag}>Hyperlend</span>
                <span className={styles.protocolTag}>+15 more</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
