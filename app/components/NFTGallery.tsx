'use client';

import { NFT } from '../lib/types';
import { useState, memo } from 'react';
import Image from 'next/image';
import styles from './NFTGallery.module.css';

interface NFTGalleryProps {
    nfts: NFT[];
}

const NFTCard = memo(({ nft }: { nft: NFT }) => {
    const [hasError, setHasError] = useState(false);

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {nft.imageUrl && !hasError ? (
                    <Image
                        src={nft.imageUrl}
                        alt={nft.name}
                        fill
                        sizes="200px"
                        quality={30}
                        className={styles.image}
                        onError={() => setHasError(true)}
                        loading="lazy"
                        unoptimized
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <span className={styles.nftLabel}>NFT</span>
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.name}>{nft.name}</div>
                <div className={styles.tokenId}>#{nft.tokenId}</div>
                {nft.collectionName && (
                    <div className={styles.collection}>{nft.collectionName}</div>
                )}
            </div>
        </div>
    );
});

NFTCard.displayName = 'NFTCard';

export default function NFTGallery({ nfts }: NFTGalleryProps) {
    const ITEMS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(nfts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentNFTs = nfts.slice(startIndex, endIndex);

    if (nfts.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No NFTs found</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>

                    <div className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </div>

                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}

            <div className={styles.grid}>
                {currentNFTs.map((nft) => (
                    <NFTCard
                        key={`${nft.tokenAddress}-${nft.tokenId}`}
                        nft={nft}
                    />
                ))}
            </div>
        </div>
    );
}
