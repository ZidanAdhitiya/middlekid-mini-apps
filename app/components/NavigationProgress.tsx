'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './NavigationProgress.module.css';

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start loading when route changes begin
        let progressInterval: NodeJS.Timeout;

        const handleStart = () => {
            setIsLoading(true);
            setProgress(0);

            // Simulate progress
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);
        };

        const handleComplete = () => {
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 200);
        };

        handleComplete();

        return () => {
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [pathname, searchParams]);

    // Listen for click events on links to start progress
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href && link.href.startsWith(window.location.origin)) {
                const href = link.getAttribute('href');
                if (href && href !== pathname && !href.startsWith('#')) {
                    setIsLoading(true);
                    setProgress(10);

                    const progressInterval = setInterval(() => {
                        setProgress(prev => {
                            if (prev >= 90) {
                                clearInterval(progressInterval);
                                return 90;
                            }
                            return prev + Math.random() * 15;
                        });
                    }, 150);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    if (!isLoading && progress === 0) return null;

    return (
        <div className={styles.container}>
            <div
                className={styles.bar}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
