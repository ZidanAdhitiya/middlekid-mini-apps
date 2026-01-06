'use client';

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasUnread(false);
        }
    };

    return (
        <>
            {/* Chat Interface */}
            {isOpen && (
                <div className={styles.chatContainer}>
                    <ChatInterface onClose={() => setIsOpen(false)} />
                </div>
            )}

            {/* Floating Button */}
            <button
                className={`${styles.floatingButton} ${isOpen ? styles.active : ''}`}
                onClick={handleToggle}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {hasUnread && <div className={styles.badge}></div>}
                    </>
                )}
            </button>
        </>
    );
}
