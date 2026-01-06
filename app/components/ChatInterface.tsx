'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../lib/types/chat';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
    onClose: () => void;
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Halo! Saya Kid, asisten AI untuk Middlekid. Ada yang bisa saya bantu? 👋',
            timestamp: new Date(),
            status: 'sent',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Focus input when opened
        inputRef.current?.focus();
    }, []);

    const quickActions = [
        { label: 'Bagaimana cara pakai app ini?', emoji: '❓' },
        { label: 'Analisis token contract', emoji: '🔍' },
        { label: 'Jelaskan DeFi positions', emoji: '📊' },
    ];

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
            status: 'sent',
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationHistory: messages,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Gagal mendapatkan respons');
            }

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                status: 'sent',
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi. 😔',
                timestamp: new Date(),
                status: 'error',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
        inputRef.current?.focus();
    };

    return (
        <div className={`${styles.chatInterface} glass`}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.avatar}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <div className={styles.headerText}>
                        <h3>Kid - AI Assistant</h3>
                        <p>Middlekid Support</p>
                    </div>
                </div>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close chat">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                    >
                        <div className={styles.messageContent}>
                            {message.content}
                        </div>
                        <div className={styles.messageTime}>
                            {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                        <div className={`${styles.messageContent} ${styles.typing}`}>
                            <div className={styles.typingDot}></div>
                            <div className={styles.typingDot}></div>
                            <div className={styles.typingDot}></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
                <div className={styles.quickActions}>
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className={styles.quickActionButton}
                            onClick={() => handleQuickAction(action.label)}
                        >
                            <span className={styles.emoji}>{action.emoji}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className={styles.inputContainer}>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    placeholder="Ketik pesan..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                />
                <button
                    className={styles.sendButton}
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
