// English translations
export const en = {
    common: {
        loading: 'Loading...',
        error: 'An error occurred',
        copy: 'Copy',
        copied: 'Copied!',
        viewMore: 'View More',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
    },

    header: {
        title: 'MiddleKid',
        nav: {
            home: 'Home',
            interpreter: 'Analyzer',
            timeMachine: 'Time Machine',
            cemetery: 'Cemetery',
        },
        profile: {
            wallet: 'My Wallet',
            disconnect: 'Disconnect',
            connect: 'Connect Wallet',
        },
        language: {
            switch: 'Ganti ke Bahasa Indonesia',
            current: 'EN',
        },
    },

    transaction: {
        explainer: {
            title: 'What is a Transaction Hash?',
            description: 'A transaction hash is like a tracking number for your parcel at FedEx/UPS. With this number, you can track where your money/tokens went, who sent it, and whether it arrived or not.',
        },
        status: {
            label: 'Transaction Status',
            success: 'Success',
            failed: 'Failed',
            pending: 'Pending',
            successExplain: 'This transaction is complete and permanently recorded on the blockchain. Like a printed receipt, it cannot be changed.',
            failedExplain: 'Transaction failed (like a declined credit card), but gas fees still apply because miners worked to process it.',
            pendingExplain: 'Transaction is still in the queue, not yet processed. Like waiting in line at checkout, just need to wait your turn.',
        },
        fields: {
            hash: 'Transaction Receipt Number',
            hashTooltip: 'Hash = like a unique tracking number that cannot be faked',
            from: 'Sender',
            fromTooltip: 'Wallet address that sent the money/tokens',
            to: 'Recipient',
            toTooltip: 'Wallet/contract address that receives the transaction',
            value: 'Amount Sent',
            valueTooltip: 'Amount of ETH transferred (excluding gas fees)',
            blockNumber: 'Block Number',
            blockTooltip: 'Block = like a page in the blockchain ledger. Your transaction is recorded on this page.',
            network: 'Blockchain Network',
            networkTooltip: 'Network = like the country where the transaction occurred (US/UK/Singapore)',
            viewProfile: 'View Profile',
        },
        hints: {
            noValue: 'No direct ETH transfer, might just be interacting with contract or swapping tokens',
            valueNote: 'This is the money sent to recipient (not including shipping/gas fees)',
            blockLocation: 'This transaction is permanently recorded on page (block) #{number} in the blockchain.',
            networkLocation: 'This transaction occurred on the {network} network',
        },
        function: {
            title: 'What Does This Transaction Do?',
            known: 'This transaction calls the {name} function in a smart contract.',
            unknown: '⚠️ Unknown function. This transaction calls a function in a smart contract, but the function name cannot be read automatically.',
            analogy: 'Analogy: Like when you press the "Swap" button in an app, the app runs the swap() function to exchange your tokens.',
            warningTitle: 'Security Tips:',
            warning: 'Be careful with transactions whose functions are unclear. Make sure you know what you are approving/doing.',
            technicalDetails: '🤓 Technical Details (for the curious)',
            inputData: 'Input Data:',
            inputNote: 'This input data contains instructions sent to the smart contract. Like a secret message in hexadecimal code.',
        },
        gas: {
            title: 'Shipping Fee (Gas Fee)',
            description: 'Gas fee is like shipping costs at FedEx. You pay miners (who manage the blockchain) to process your transaction.',
            used: '~{gas} gas used',
            note: 'The more complex the transaction (e.g. swap vs simple transfer), the more gas needed = more expensive shipping.',
        },
        explorer: {
            question: 'Want to see more complete information?',
            button: 'View on Block Explorer (Basescan)',
            note: 'Block Explorer = like a package tracking website, but for blockchain. Here you can see all transaction details more completely.',
        },
    },

    wallet: {
        explainer: {
            title: 'What is a Wallet Address?',
            description: 'A wallet address is like your bank account number in the crypto world. The difference is, on the blockchain everyone can see your balance and transaction history (but your name stays secret, only the number is visible).',
        },
        profile: {
            title: 'Wallet Profile',
            personal: 'Your Wallet',
        },
        fields: {
            address: 'Wallet Address',
            addressTooltip: 'Like a bank account number',
            type: 'Wallet Type',
            typeTooltip: 'Is this a human wallet or a bot?',
            age: 'Wallet Age',
            ageTooltip: 'How long has this wallet existed?',
            totalTx: 'Total Transactions',
            totalTxTooltip: 'How many times has this wallet transacted?',
        },
        types: {
            human: 'Regular Human',
            bot: 'Robot/Bot',
            exchange: 'Exchange',
            unknown: 'Unknown',
        },
        ageHints: {
            newWallet: '🆕 New wallet! No long track record yet',
            youngWallet: '📅 Young wallet, just a few weeks old',
            matureWallet: '📆 Mature wallet, has history of several months',
            veteranWallet: '🏆 Veteran wallet! Been active for over a year',
        },
        txHint: 'Average: {avg} transactions per day',
        risk: {
            title: 'Wallet Security Level',
            safe: 'Safe ✅',
            low: 'Low Risk 🟢',
            medium: 'Medium Risk 🟡',
            high: 'High Risk 🔴',
            critical: 'DANGER! ⛔',
            meaning: 'Meaning:',
            action: 'What You Should Do:',
        },
        bot: {
            title: 'Robot Detected!',
            confidence: 'Confidence Level: {percent}%',
            whatIsBot: 'What is a Bot?',
            botExplanation: 'Bot = a computer program that automatically trades/transacts without human intervention. Usually used for arbitrage (finding price differences) or MEV (Maximal Extractable Value).',
            indicators: {
                highFrequency: '📈 Super Fast Transactions',
                uniformTiming: '⏱️ Very Regular Timing',
                mevActivity: '⚡ MEV Activity',
            },
        },
        security: {
            title: 'Security Checks',
            severity: {
                critical: '🔴 Critical',
                high: '🟠 High',
                medium: '🟡 Medium',
                low: '🟢 Low',
            },
        },
        recommendations: {
            title: 'Recommendations for You',
        },
        explorer: {
            question: 'Want to see complete wallet details?',
            button: 'View on Block Explorer (Basescan)',
            note: 'There you can see all transactions, token holdings, and NFTs owned by this wallet',
        },
    },

    token: {
        explainer: {
            title: 'What is a Token Contract?',
            description: 'A token contract is like a digital money factory. It is a program on the blockchain that manages tokens (like USDC, PEPE, etc). This smart contract determines who owns how many tokens, whether they can transfer or not, etc.',
        },
        info: {
            title: 'Token Contract Info',
            address: 'Contract Address',
            addressTooltip: 'The address of this token factory',
        },
        risk: {
            title: 'Token Security Assessment',
            status: 'Security Status:',
            dangerWarning: '⚠️ DANGER WARNING!',
            dangerMessage: 'This token is very high risk. Avoid interacting with this contract!',
        },
        checks: {
            title: 'Security Checks',
            noIssues: 'No security issues detected! This token looks safe.',
            meaning: 'Meaning:',
        },
        education: {
            title: 'Term Explanations (for Beginners)',
            honeypot: {
                question: 'What is "Honeypot"?',
                answer1: 'Honeypot = A token you can buy, but CANNOT SELL. Like a honey trap for bees - once in, cannot get out.',
                answer2: 'Scammers create tokens where only the owner can sell. Others buy, stuck forever. Your money is gone!',
            },
            tax: {
                question: 'What is "Tax" in Tokens?',
                answer1: 'Tax = automatic deduction every time you buy/sell tokens.',
                answer2: 'For example 10% tax means every time you sell 100 tokens, only 90 arrive. 10% is deducted by the contract. Normal tax = 1-5%. If more than 10% = red flag!',
            },
            verified: {
                question: 'What is "Contract Verified"?',
                answer1: 'Verified = source code of the contract is open to the public and verified.',
                answer2: 'Like a restaurant with a glass kitchen - everyone can see if the cooking is clean or not. Unverified tokens = harder to trust (we don\'t know what\'s in the code).',
            },
            holders: {
                question: 'Why is "Holder Count" important?',
                answer1: 'Holder Count = how many wallets own this token.',
                answer2: 'More holders = more people trust it. If less than 100 holders = token is very early stage or scam. If more than 10,000 holders = token is fairly established.',
            },
        },
        recommendations: {
            title: 'Recommendations for You',
        },
        explorer: {
            question: 'Want to check the contract yourself?',
            button: 'View Contract on Basescan',
            note: 'There you can see the source code, holder list, and transactions of this token',
        },
    },

    interpreter: {
        title: 'Transaction Analyzer',
        subtitle: 'Understand your wallet activity and transaction details',
        info: {
            title: 'What can I analyze?',
            description: 'Enter a wallet address, transaction hash, or token contract to view detailed analysis and security insights.',
        },
        infoBox: {
            title: 'What can I analyze?',
            description: 'Enter a wallet address, transaction hash, or token contract to view detailed analysis and security insights.',
        },
        mode: {
            label: 'Analysis Mode:',
            wallet: '👤 Personal Wallet',
            token: '🪙 Token Contract',
            transaction: '📜 Transaction Hash',
        },
        input: {
            placeholder: 'Enter address, tx hash, or token contract...',
            networkSelect: 'Select network in dropdown (Base). System will auto-detect input type.',
        },

        loading: {
            default: 'Analyzing transaction...',
            wallet: 'Analyzing personal wallet... 👤',
            token: 'Analyzing token contract... 🪙',
            messages: [
                "Peeking into your wallet... 🔍",
                "Checking for digital gremlins... 👻",
                "Counting transaction sins... 📊",
                "Hunting for scammer footprints... 🕵️",
                "Analyzing bot patterns... 🤖",
                "Checking suspicious tokens... ⚠️",
                "Auditing your blockchain spending... 💸",
                "Stalking your wallet... 👀"
            ]
        },
        errors: {
            invalidData: 'Error: Invalid transaction data. Ensure JSON format is correct.',
            invalidInput: 'Invalid input! Ensure address or hash format is correct (0x...)',
            analysisFailed: 'Error: Analysis failed. Ensure address is valid and try again.',
            txNotFound: 'Transaction not found on {network} network.',
            fetchFailed: 'Failed to fetch transaction',
        },
        results: {
            found: 'Transactions Found: {count}',
            hint: 'Showing analysis for the first transaction. Click other transactions to view their analysis.',
        },
        search: {
            title: 'Search',
            placeholder: 'Search by Address / Txn Hash / Token / Contract Address',
            example: 'Try example:',
            hint: 'Select network in dropdown ({network}). System will auto-detect input type.',
            detect: {
                tx: 'Transaction',
                address: 'Address',
                unknown: 'Unknown'
            }
        },
        detection: {
            mode: 'Analysis Mode:',
            personal: '👤 Personal Wallet',
            token: '🪙 Token Contract',
            tx: '📜 Transaction Hash'
        }
    },
    warningTranslation: {
        title: 'Transaction Explanation',
        empty: 'No analysis yet. Please enter transaction data first.',
        severity: {
            warning: 'Warning',
            caution: 'Caution',
            info: 'Info',
        },
        whatHappened: 'What Happened?',
        impact: 'Impact:',
        technicalDetails: 'Technical Details',
        disclaimer: 'Note: This is an educational explanation, not security advice. The final decision is yours. We do not judge whether this is "safe" or "scam".'
    },

    dashboard: {
        level: 'Level',
        points: 'Points',
        toLevel: 'to Level',
        healthScore: 'Wallet Health Score',
        achievements: {
            title: 'Achievements',
            unlocked: 'Unlocked',
            locked: 'Locked',
            unlockedBadge: '✓ Unlocked'
        },
        stats: {
            title: 'Wallet Statistics',
            daysOld: 'Days Old',
            transactions: 'Transactions',
            txPerDay: 'Tx/Day',
            contracts: 'Contracts',
        },
        healthBreakdown: {
            title: 'Health Score Breakdown',
        }
    },

    timeMachine: {
        title: 'Time Machine Analysis',
        subtitle: 'See missed opportunities and what "could have been"',
        connectPrompt: 'Connect wallet to view your Time Machine analysis',
        analyzeButton: 'Start Time Machine Analysis',
        loading: 'Analyzing transaction history...',
        loadingHint: 'This might take a moment, please wait...',
        error: 'Failed to analyze wallet. Please try again.',
        summary: {
            title: 'Summary',
            totalRegrets: 'Total Regrets',
            potentialGain: 'Potential Gain',
            biggestMiss: 'Biggest Miss',
        },
        regrets: {
            title: 'Your Biggest Regrets',
        },
        regret: {
            sold: 'Sold',
            soldAt: 'Sold at',
            peakPrice: 'Peak Price',
            level: 'Regret Level',
        },
        noRegrets: {
            title: 'No Regrets!',
            description: 'You haven\'t sold any tokens, or your timing was perfect!',
        },
        refresh: 'Refresh Analysis',
    },

    cemetery: {
        title: 'Scam Token Cemetery',
        subtitle: 'Wall of Shame for all detected scam tokens',
        backToAnalyzer: '← Back to Analyzer',
        stats: {
            scamsDetected: 'Scam Tokens Detected',
            totalLoss: 'Estimated Total Loss',
            victims: 'Victims Protected',
        },
        searchPlaceholder: '🔍 Search by name, symbol, or address...',
        filter: {
            all: 'All ({count})',
            honeypot: '🍯 Honeypot',
            rugPull: '🏃 Rug Pull',
            fakeToken: '🎭 Fake Token',
            highTax: '💸 High Tax',
        },
        tabs: {
            all: 'All Scams',
            hallOfFame: '🏆 Hall of Fame',
            trending: '📈 Trending',
        },
        empty: {
            title: 'No Scams Yet',
            description: 'Good news! No scam tokens detected yet.',
        },
        card: {
            rip: 'R.I.P',
            loss: 'Loss:',
            victims: 'victims',
        },
        leaderboard: {
            title: '🏆 Top 10 Biggest Scams',
            totalLoss: 'Total Loss',
        },
        trending: {
            title: '📈 Most Reported This Week',
            hot: 'Hot',
            reports: 'reports',
        },
    },
    analysis: {
        wallet: {
            risk: {
                critical: '⛔ HIGH DANGER! This wallet has many red flags. Avoid large transactions.',
                high: '⚠️ HIGH RISK. Some security checks failed. Interact with caution.',
                medium: '⚡ Medium Risk. Some points to note, but not critical.',
                low: '✅ Low Risk. Wallet looks reasonably safe.',
                safe: '✅ Safe Wallet. No significant issues detected.',
            },
            checks: {
                phishing: {
                    name: 'Phishing Interaction',
                    detected: 'This wallet has interacted with known phishing contracts',
                    clean: 'No history of interaction with phishing sites',
                    recommendation: '🎣 Revoke all approvals from suspicious contracts on revoke.cash'
                },
                approval: {
                    name: 'High Approval Exposure',
                    high: 'Too many active unlimited approvals - high theft risk',
                    safe: 'Approvals are well controlled',
                    recommendation: '🔓 Revoke unlimited approvals before it\'s too late!'
                },
                suspicious: {
                    name: 'Suspicious Activity',
                    detected: 'Abnormal activity pattern or bot detected',
                    clean: 'Activity pattern looks normal',
                    recommendation: '🚨 Manually check transaction history to ensure nothing is strange'
                }
            },
            bot: {
                title: 'Bot Detected! 🤖',
                detected: 'Bot detected: {reasons}',
                clean: 'Normal human transaction pattern',
                reasons: {
                    frequency: 'very high frequency (>100 tx/day)',
                    timing: 'transaction timing too regular',
                    mev: 'MEV activity detected',
                    flash: 'flash loan interaction',
                    pattern: 'no human pattern'
                },
                recommendation: '⚠️ This is likely a bot - do not transfer large funds without verification'
            },
            human: {
                fresh: {
                    title: 'Newborn Baby Wallet 👶',
                    description: 'This wallet was just created. No reputation yet, so the system cannot determine if it\'s malicious. Be careful with large transfers.',
                    action: 'Try a small transaction first (test the waters).'
                },
                bot: {
                    title: 'Bot Detected! 🤖',
                    description: 'This is not a normal human wallet. {reason}. Likely a trading bot or MEV bot.',
                    action: 'Be careful if interacting - could be an aggressive automated system.'
                },
                highApproval: {
                    title: 'Your Door is Wide Open! 🔓',
                    description: 'You gave "Unlimited" permission to many apps. This means they can take your money anytime without asking. Very dangerous if they get hacked.',
                    action: 'Use "Revoke Approval" feature right now on revoke.cash!'
                },
                phishing: {
                    title: 'You Click Malicious Links 🎣',
                    description: 'Traces of interaction with scam websites. Maybe you joined a fake airdrop or clicked random links in Telegram/Discord.',
                    action: 'Stop clicking free gifts! Always check URLs before connecting wallet.'
                },
                clean: {
                    title: 'Wallet Looks Safe ✅',
                    description: 'So far no significant red flags. Transaction pattern looks normal and no interaction with dangerous contracts.',
                    action: 'Stay vigilant and don\'t approve contracts randomly!'
                }
            },
            recommendations: {
                default: '✅ Wallet looks safe, but always DYOR before large transactions',
                check: '💡 Always double-check contract address before approving'
            }
        },
        token: {
            risk: {
                critical: '⛔ VERY RISKY! {count} critical issues found. AVOID this token!',
                high: '⚠️ HIGH RISK. {count} issues found. Be careful!',
                medium: '⚡ Medium Risk. Some red flags found. Research further.',
                low: '✅ Low Risk. Token looks safe, but DYOR.',
                safe: '✅ Token looks safe. All security checks passed.',
            },
            checks: {
                verified: {
                    name: 'Smart Contract Code Verification',
                    verified: 'Smart contract code is verified and public',
                    unverified: 'Smart contract code is NOT verified - code cannot be read (BE CAREFUL)',
                    recommendation: 'Check the smart contract code before investing. If not verified, DON\'T!'
                },
                honeypot: {
                    name: 'Honeypot Detection',
                    detected: '🚨 HONEYPOT! You can buy this token but CANNOT SELL. You will lose money!',
                    safe: 'Safe - Token can be bought and sold normally',
                    recommendation: 'DO NOT BUY - This is a trap! You won\'t be able to sell!'
                },
                holders: {
                    name: 'Token Holder Distribution',
                    centralized: 'Top holder owns {percent}% of tokens - too much in one person (RISK!)',
                    distributed: 'Good distribution - tokens are spread evenly (top holder: {percent}%)'
                },
                liquidity: {
                    name: 'Liquidity Status (Pool Funds)',
                    locked: 'Pool funds are locked - developer cannot run away with your money',
                    unlocked: 'Pool funds are NOT locked - developer can drain all funds anytime (RUG PULL)',
                    recommendation: 'Pool funds not locked - developer can rug pull. BE VERY CAREFUL!'
                },
                scamDb: {
                    name: 'Scam Database Check',
                    detected: '🚨 THIS TOKEN IS LISTED AS A SCAM! DO NOT BUY!',
                    safe: 'Not detected in scam database',
                    recommendation: 'This token is listed as a scam. AVOID 100%!'
                },
                age: {
                    name: 'Token Age',
                    new: 'Token is very new ({days} days) - untested, higher risk',
                    old: 'Token is {days} days old - established'
                },
                mint: {
                    name: 'Unlimited Mint Function',
                    detected: 'Owner can mint unlimited tokens - value can crash due to inflation',
                    safe: 'No unlimited mint function - supply is safe'
                }
            },
            recommendations: {
                default: 'Token looks legitimate, but always do your own research (DYOR).',
                invest: 'Don\'t invest more than you can afford to lose.'
            }
        },
        health: {
            factors: {
                noScam: {
                    name: 'Scam-Free Tokens',
                    description: '{count} scam tokens detected in wallet'
                },
                limitedApprovals: {
                    name: 'Controlled Approvals',
                    description: 'No dangerous unlimited approvals'
                },
                walletAge: {
                    name: 'Wallet Age',
                    description: 'Wallet is {days} days old'
                },
                diversity: {
                    name: 'Portfolio Diversity',
                    description: '{count} legitimate tokens in wallet'
                },
                noPhishing: {
                    name: 'No Phishing',
                    description: 'No interaction with phishing sites'
                },
                activity: {
                    name: 'Healthy Activity',
                    description: 'Normal human transaction pattern'
                }
            },
            achievements: {
                scamAvoider: {
                    name: 'Clean Portfolio',
                    description: 'Your collection contains only verified assets. You successfully avoided risky tokens.',
                    requirement: 'Hold zero risky tokens'
                },
                approvalMaster: {
                    name: 'Permission Controller',
                    description: 'You keep full control over your assets. No unlimited access granted.',
                    requirement: 'No unlimited permissions'
                },
                ogHolder: {
                    name: 'Senior Account',
                    description: 'Your account has 3+ years of history. You are part of the early community.',
                    requirement: 'Account age > 3 years'
                },
                diversified: {
                    name: 'Balanced Collection',
                    description: 'You hold 10+ verified assets. Good risk management strategy.',
                    requirement: '10+ verified assets'
                },
                activeTrader: {
                    name: 'Routine Activity',
                    description: 'You have completed 100+ actions. Your account shows healthy, consistent usage.',
                    requirement: '100+ activities completed'
                }
            },
            strengths: {
                perfect: '✅ {name} - Perfect!',
                empty: '⚡ Still room for improvement'
            },
            weaknesses: {
                issue: '⚠️ {name} - Needs improvement',
                empty: '🎉 No significant weaknesses!'
            }
        }
    },
} as const;
