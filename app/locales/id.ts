// Indonesian translations
export const id = {
    common: {
        loading: 'Memuat...',
        error: 'Terjadi kesalahan',
        copy: 'Salin',
        copied: 'Tersalin!',
        viewMore: 'Lihat Lebih',
        close: 'Tutup',
        back: 'Kembali',
        next: 'Selanjutnya',
        submit: 'Kirim',
        cancel: 'Batal',
        save: 'Simpan',
        delete: 'Hapus',
        edit: 'Edit',
    },

    header: {
        title: 'MiddleKid',
        nav: {
            home: 'Beranda',
            interpreter: 'Analyzer',
            timeMachine: 'Time Machine',
            cemetery: 'Cemetery',
        },
        profile: {
            wallet: 'Wallet Saya',
            disconnect: 'Putuskan',
            connect: 'Hubungkan Wallet',
        },
        language: {
            switch: 'Switch to English',
            current: 'ID',
        },
    },

    transaction: {
        explainer: {
            title: 'Apa itu Transaksi Hash?',
            description: 'Transaksi hash itu seperti nomor resi paket kamu di JNE/Shopee. Dengan nomor ini, kamu bisa lacak kemana uang/token kamu pergi, siapa yang kirim, dan apakah sudah sampai atau belum.',
        },
        status: {
            label: 'Status Transaksi',
            success: 'Berhasil',
            failed: 'Gagal',
            pending: 'Sedang Diproses',
            successExplain: 'Transaksi ini sudah selesai dan tercatat permanent di blockchain. Seperti struk belanja yang sudah dicetak, tidak bisa diubah lagi.',
            failedExplain: 'Transaksi gagal (seperti kartu kredit ditolak), tapi biaya gas tetap kena karena miners sudah bekerja untuk memprosesnya.',
            pendingExplain: 'Transaksi masih dalam antrian, belum diproses. Seperti mengantri di kasir, tinggal tunggu giliran.',
        },
        fields: {
            hash: 'Nomor Resi Transaksi',
            hashTooltip: 'Hash = seperti nomor resi unik yang tidak bisa dipalsukan',
            from: 'Pengirim',
            fromTooltip: 'Alamat wallet yang mengirim uang/token',
            to: 'Penerima',
            toTooltip: 'Alamat wallet/kontrak yang menerima transaksi',
            value: 'Uang yang Dikirim',
            valueTooltip: 'Jumlah ETH yang ditransfer (tidak termasuk biaya gas)',
            blockNumber: 'Nomor Blok',
            blockTooltip: 'Blok = seperti halaman di buku besar blockchain. Transaksi kamu tercatat di halaman ini.',
            network: 'Jaringan Blockchain',
            networkTooltip: 'Network = seperti negara tempat transaksi terjadi (Indonesia/Singapore/USA)',
            viewProfile: 'Lihat Profile',
        },
        hints: {
            noValue: 'Tidak ada transfer ETH langsung, mungkin hanya interact dengan kontrak atau swap token',
            valueNote: 'Ini uang yang dikirim ke penerima (belum termasuk ongkos kirim/gas)',
            blockLocation: 'Transaksi ini tercatat permanent di halaman (blok) #{number} di blockchain.',
            networkLocation: 'Transaksi ini terjadi di jaringan {network}',
        },
        function: {
            title: 'Apa yang Dilakukan Transaksi Ini?',
            known: 'Transaksi ini memanggil fungsi {name} di smart contract.',
            unknown: '⚠️ Fungsi tidak dikenal. Transaksi ini memanggil fungsi di smart contract, tapi nama fungsinya tidak bisa dibaca otomatis.',
            analogy: 'Analogi: Seperti kamu tekan tombol "Swap" di aplikasi, maka aplikasi akan menjalankan fungsi swap() untuk menukar token kamu.',
            warningTitle: 'Tips Keamanan:',
            warning: 'Hati-hati dengan transaksi yang fungsinya tidak jelas. Pastikan kamu tahu apa yang sedang kamu approve/lakukan.',
            technicalDetails: '🤓 Detail Teknis (untuk yang penasaran)',
            inputData: 'Input Data:',
            inputNote: 'Input data ini berisi instruksi yang dikirim ke smart contract. Seperti pesan rahasia dalam kode hexadecimal.',
        },
        gas: {
            title: 'Biaya Pengiriman (Gas Fee)',
            description: 'Gas fee itu seperti ongkos kirim di JNE. Kamu bayar miners (yang ngurusin blockchain) untuk memproses transaksi kamu.',
            used: '~{gas} gas dipakai',
            note: 'Makin kompleks transaksinya (misal swap vs transfer biasa), makin banyak gas yang dibutuhkan = ongkir lebih mahal.',
        },
        explorer: {
            question: 'Mau lihat informasi lebih lengkap?',
            button: 'Lihat di Block Explorer (Basescan)',
            note: 'Block Explorer = seperti situs tracking paket, tapi untuk blockchain. Di sini kamu bisa lihat semua detail transaksi dengan lebih lengkap.',
        },
    },

    wallet: {
        explainer: {
            title: 'Apa itu Wallet Address?',
            description: 'Wallet address itu seperti nomor rekening bank kamu di dunia crypto. Bedanya, di blockchain semua orang bisa lihat saldo dan riwayat transaksi kamu (tapi namamu tetap rahasia, hanya nomornya yang keliatan).',
        },
        profile: {
            title: 'Profil Wallet',
            personal: 'Wallet Kamu',
        },
        fields: {
            address: 'Alamat Wallet',
            addressTooltip: 'Seperti nomor rekening bank',
            type: 'Tipe Wallet',
            typeTooltip: 'Apakah ini wallet manusia atau bot?',
            age: 'Umur Wallet',
            ageTooltip: 'Sudah berapa lama wallet ini ada?',
            totalTx: 'Total Transaksi',
            totalTxTooltip: 'Berapa kali wallet ini bertransaksi?',
        },
        types: {
            human: 'Manusia Biasa',
            bot: 'Robot/Bot',
            exchange: 'Exchange/Bursa',
            unknown: 'Tidak Diketahui',
        },
        ageHints: {
            newWallet: '🆕 Wallet baru! Belum punya track record panjang',
            youngWallet: '📅 Wallet masih muda, baru beberapa minggu',
            matureWallet: '📆 Wallet sudah cukup dewasa, ada history beberapa bulan',
            veteranWallet: '🏆 Wallet veteran! Sudah lebih dari setahun aktif',
        },
        txHint: 'Rata-rata: {avg} transaksi per hari',
        risk: {
            title: 'Tingkat Keamanan Wallet',
            safe: 'Aman ✅',
            low: 'Risiko Rendah 🟢',
            medium: 'Risiko Sedang 🟡',
            high: 'Risiko Tinggi 🔴',
            critical: 'BAHAYA! ⛔',
            meaning: 'Artinya:',
            action: 'Yang Harus Kamu Lakukan:',
        },
        bot: {
            title: 'Robot Terdeteksi!',
            confidence: 'Tingkat Keyakinan: {percent}%',
            whatIsBot: 'Apa itu Bot?',
            botExplanation: 'Bot = program komputer yang otomatis trading/bertransaksi tanpa campur tangan manusia. Biasanya dipakai untuk arbitrage (cari selisih harga) atau MEV (Maximal Extractable Value).',
            indicators: {
                highFrequency: '📈 Transaksi Super Cepat',
                uniformTiming: '⏱️ Waktu Teratur Banget',
                mevActivity: '⚡ Aktivitas MEV',
            },
        },
        security: {
            title: 'Pemeriksaan Keamanan',
            severity: {
                critical: '🔴 Kritis',
                high: '🟠 Tinggi',
                medium: '🟡 Sedang',
                low: '🟢 Rendah',
            },
        },
        recommendations: {
            title: 'Saran untuk Kamu',
        },
        explorer: {
            question: 'Mau lihat detail lengkap wallet ini?',
            button: 'Lihat di Block Explorer (Basescan)',
            note: 'Di sana kamu bisa lihat semua transaksi, token holdings, dan NFT yang dimiliki wallet ini',
        },
    },

    token: {
        explainer: {
            title: 'Apa itu Token Contract?',
            description: 'Token contract itu seperti pabrik uang digital. Ini adalah program di blockchain yang mengatur token (seperti USDC, PEPE, dll). Smart contract ini yang nentuin siapa punya berapa token, bisa transfer atau nggak, dll.',
        },
        info: {
            title: 'Info Token Contract',
            address: 'Alamat Contract',
            addressTooltip: 'Alamat pabrik token ini',
        },
        risk: {
            title: 'Penilaian Keamanan Token',
            status: 'Status Keamanan:',
            dangerWarning: '⚠️ PERINGATAN BAHAYA!',
            dangerMessage: 'Token ini sangat berisiko tinggi. Hindari berinteraksi dengan contract ini!',
        },
        checks: {
            title: 'Pemeriksaan Keamanan',
            noIssues: 'Tidak ada masalah keamanan terdeteksi! Token ini terlihat aman.',
            meaning: 'Artinya:',
        },
        education: {
            title: 'Penjelasan Istilah (untuk Pemula)',
            honeypot: {
                question: 'Apa itu "Honeypot"?',
                answer1: 'Honeypot = Token yang bisa kamu beli, tapi TIDAK BISA DIJUAL. Seperti jebakan madu untuk lebah - sekali masuk, nggak bisa keluar.',
                answer2: 'Scammer bikin token yang cuma owner-nya bisa jual. Orang lain beli, stuck selamanya. Uangmu hilang!',
            },
            tax: {
                question: 'Apa itu "Tax" di Token?',
                answer1: 'Tax = potongan otomatis setiap kali kamu beli/jual token.',
                answer2: 'Misalnya tax 10%, berarti setiap kali kamu jual 100 token, cuma 90 yang sampai. 10% dipotong sama contract. Tax wajar = 1-5%. Kalau lebih dari 10% = red flag!',
            },
            verified: {
                question: 'Apa itu "Contract Verified"?',
                answer1: 'Verified = source code contract dibuka untuk umum dan diverifikasi.',
                answer2: 'Seperti restoran yang dapurnya kaca transparan - semua orang bisa lihat masakannya bersih atau nggak. Token yang TIDAK verified = lebih susah dipercaya (kita nggak tahu isi kodenya apa).',
            },
            holders: {
                question: 'Apa pentingnya "Holder Count"?',
                answer1: 'Holder Count = berapa banyak wallet yang punya token ini.',
                answer2: 'Makin banyak holder = makin banyak orang percaya. Kalau cuma kurang dari 100 holder = token masih awal banget atau scam. Kalau lebih dari 10,000 holder = token lumayan established.',
            },
        },
        recommendations: {
            title: 'Saran untuk Kamu',
        },
        explorer: {
            question: 'Mau cek sendiri contract-nya?',
            button: 'Lihat Contract di Basescan',
            note: 'Di sana kamu bisa lihat source code, holder list, dan transaksi token ini',
        },
    },

    interpreter: {
        title: 'Transaction Analyzer',
        subtitle: 'Pahami aktivitas wallet dan detail transaksi kamu',
        info: {
            title: 'Apa yang bisa saya analisis?',
            description: 'Masukkan wallet address, transaction hash, atau token contract untuk melihat analisis detail dan insight keamanan.',
        },
        infoBox: {
            title: 'Apa yang bisa saya analisis?',
            description: 'Masukkan wallet address, transaction hash, atau token contract untuk melihat analisis detail dan insight keamanan.',
        },
        mode: {
            label: 'Mode Analisis:',
            wallet: '👤 Wallet Personal',
            token: '🪙 Token Contract',
            transaction: '📜 Transaction Hash',
        },
        input: {
            placeholder: 'Masukkan address, tx hash, atau token contract...',
            networkSelect: 'Pilih network di dropdown (Base). Sistem akan otomatis detect jenis input.',
        },

        loading: {
            default: 'Menganalisis transaksi...',
            wallet: 'Menganalisis wallet personal... 👤',
            token: 'Menganalisis token contract... 🪙',
            messages: [
                "Sedang mengintip isi dompet... 🔍",
                "Mengecek apakah ada tuyul digital... 👻",
                "Menghitung dosa-dosa transaksi... 📊",
                "Mencari jejak scammer... 🕵️",
                "Menganalisis pola bot... 🤖",
                "Memeriksa token mencurigakan... ⚠️",
                "Mengaudit riwayat jajanmu di blockchain... 💸",
                "Sedang nge-stalk wallet kamu... 👀"
            ]
        },
        errors: {
            invalidData: 'Error: Data transaksi tidak valid. Pastikan format JSON benar.',
            invalidInput: 'Input tidak valid! Pastikan format address atau hash benar (0x...)',
            analysisFailed: 'Error: Gagal menganalisis. Pastikan address valid dan coba lagi.',
            txNotFound: 'Transaction tidak ditemukan di {network} network.',
            fetchFailed: 'Gagal fetch transaction',
        },
        results: {
            found: 'Transaksi Ditemukan: {count}',
            hint: 'Menampilkan analisis untuk transaksi pertama. Klik transaksi lain untuk melihat analisisnya.',
        },
        search: {
            title: 'Pencarian',
            placeholder: 'Cari Address / Txn Hash / Token / Contract Address',
            example: 'Coba contoh:',
            hint: 'Pilih network di dropdown ({network}). Sistem akan otomatis detect jenis input.',
            detect: {
                tx: 'Transaksi',
                address: 'Address',
                unknown: 'Unknown'
            }
        },
        detection: {
            mode: 'Mode Analisis:',
            personal: '👤 Wallet Personal',
            token: '🪙 Token Contract',
            tx: '📜 Transaction Hash'
        }
    },
    warningTranslation: {
        title: 'Penjelasan Transaksi',
        empty: 'Belum ada analisis. Masukkan data transaksi terlebih dahulu.',
        severity: {
            warning: 'Perhatian',
            caution: 'Hati-hati',
            info: 'Info',
        },
        whatHappened: 'Apa Yang Terjadi?',
        impact: 'Dampak:',
        technicalDetails: 'Detail Teknis',
        disclaimer: 'Catatan: Ini adalah penjelasan edukatif, bukan penilaian keamanan. Keputusan akhir ada di tangan Anda. Kami tidak menilai apakah ini "aman" atau "scam".'
    },

    dashboard: {
        level: 'Level',
        points: 'Poin',
        toLevel: 'menuju Level',
        healthScore: 'Skor Kesehatan Wallet',
        achievements: {
            title: 'Pencapaian',
            unlocked: 'Terbuka',
            locked: 'Terkunci',
            unlockedBadge: '✓ Terbuka'
        },
        stats: {
            title: 'Statistik Wallet',
            daysOld: 'Umur (Hari)',
            transactions: 'Transaksi',
            txPerDay: 'Tx/Hari',
            contracts: 'Kontrak',
        },
        healthBreakdown: {
            title: 'Rincian Skor Kesehatan',
        }
    },

    timeMachine: {
        title: 'Analisis Mesin Waktu',
        subtitle: 'Lihat peluang yang terlewatkan dan apa yang "seharusnya" terjadi',
        connectPrompt: 'Hubungkan wallet untuk melihat analisis Mesin Waktu kamu',
        analyzeButton: 'Mulai Analisis Mesin Waktu',
        loading: 'Menganalisis riwayat transaksi...',
        loadingHint: 'Ini mungkin butuh waktu sebentar, sabar ya...',
        error: 'Gagal menganalisis wallet. Silakan coba lagi.',
        summary: {
            title: 'Ringkasan',
            totalRegrets: 'Total Penyesalan',
            potentialGain: 'Potensi Keuntungan',
            biggestMiss: 'Kehilangan Terbesar',
        },
        regrets: {
            title: 'Penyesalan Terbesar Kamu',
        },
        regret: {
            sold: 'Terjual',
            soldAt: 'Dijual di harga',
            peakPrice: 'Harga Puncak',
            level: 'Tingkat Penyesalan',
        },
        noRegrets: {
            title: 'Tidak Ada Penyesalan!',
            description: 'Kamu belum pernah jual token, atau timing kamu sempurna!',
        },
        refresh: 'Refresh Analisis',
    },

    cemetery: {
        title: 'Kuburan Token Scam',
        subtitle: 'Wall of Shame untuk semua token scam yang terdeteksi',
        backToAnalyzer: '← Kembali ke Analyzer',
        stats: {
            scamsDetected: 'Token Scam Terdeteksi',
            totalLoss: 'Estimasi Total Kerugian',
            victims: 'Korban Terlindungi',
        },
        searchPlaceholder: '🔍 Cari nama, simbol, atau address...',
        filter: {
            all: 'Semua ({count})',
            honeypot: '🍯 Honeypot',
            rugPull: '🏃 Rug Pull',
            fakeToken: '🎭 Fake Token',
            highTax: '💸 Pajak Tinggi',
        },
        tabs: {
            all: 'Semua Scam',
            hallOfFame: '🏆 Hall of Fame',
            trending: '📈 Sedang Trending',
        },
        empty: {
            title: 'Belum Ada Scam',
            description: 'Kabar baik! Belum ada token scam terdeteksi.',
        },
        card: {
            rip: 'R.I.P',
            loss: 'Kerugian:',
            victims: 'korban',
        },
        leaderboard: {
            title: '🏆 Top 10 Scam Terbesar',
            totalLoss: 'Total Kerugian',
        },
        trending: {
            title: '📈 Paling Banyak Dilaporkan Minggu Ini',
            hot: 'Panas',
            reports: 'laporan',
        },
    },
    analysis: {
        wallet: {
            risk: {
                critical: '⛔ BAHAYA TINGGI! Dompet ini memiliki banyak red flags. Hindari transaksi besar.',
                high: '⚠️ RISIKO TINGGI. Beberapa security check gagal. Hati-hati berinteraksi.',
                medium: '⚡ Risiko sedang. Beberapa hal perlu diperhatikan, tapi tidak kritis.',
                low: '✅ Risiko rendah. Dompet terlihat cukup aman.',
                safe: '✅ Dompet aman. Tidak ada masalah signifikan terdeteksi.',
            },
            checks: {
                phishing: {
                    name: 'Interaksi dengan Situs Phishing',
                    detected: 'Wallet ini pernah berinteraksi dengan kontrak phishing yang dikenal',
                    clean: 'Tidak ada riwayat interaksi dengan situs phishing',
                    recommendation: '🎣 Revoke semua approval dari kontrak mencurigakan di revoke.cash'
                },
                approval: {
                    name: 'Exposure Approval Tinggi',
                    high: 'Terlalu banyak approval unlimited aktif - risiko pencurian tinggi',
                    safe: 'Approval terkontrol dengan baik',
                    recommendation: '🔓 Cabut approval unlimited sebelum terlambat!'
                },
                suspicious: {
                    name: 'Aktivitas Mencurigakan',
                    detected: 'Terdeteksi pola aktivitas tidak normal atau bot',
                    clean: 'Pola aktivitas terlihat normal',
                    recommendation: '🚨 Periksa riwayat transaksi secara manual untuk memastikan tidak ada yang aneh'
                }
            },
            bot: {
                title: 'Robot Terdeteksi! 🤖',
                detected: 'Bot terdeteksi: {reasons}',
                clean: 'Pola transaksi normal seperti manusia',
                reasons: {
                    frequency: 'transaksi sangat sering (>100/hari)',
                    timing: 'waktu transaksi terlalu teratur',
                    mev: 'aktivitas MEV terdeteksi',
                    flash: 'interaksi flash loan',
                    pattern: 'tidak ada pola manusia'
                },
                recommendation: '⚠️ Ini kemungkinan bot - jangan transfer dana besar tanpa verifikasi lebih lanjut'
            },
            human: {
                fresh: {
                    title: 'Dompet Bayi Baru Lahir 👶',
                    description: 'Dompet ini baru saja dibuat. Belum ada reputasi, jadi sistem belum bisa memastikan apakah ini jahat atau tidak. Hati-hati kalau mau kirim uang besar.',
                    action: 'Coba transaksi kecil dulu (tes ombak).'
                },
                bot: {
                    title: 'Robot Terdeteksi! 🤖',
                    description: 'Ini bukan wallet manusia biasa. {reason}. Kemungkinan ini adalah bot trading atau MEV bot.',
                    action: 'Hati-hati jika berinteraksi - bisa jadi sistem otomatis yang agresif.'
                },
                highApproval: {
                    title: 'Pintu Rumahmu Terbuka Lebar! 🔓',
                    description: 'Kamu memberikan izin "Unlimited" ke banyak aplikasi. Artinya aplikasi itu bisa mengambil uangmu kapan saja tanpa permisi lagi. Ini bahaya banget kalau aplikasinya kena hack.',
                    action: 'Gunakan fitur "Revoke Approval" sekarang juga di revoke.cash!'
                },
                phishing: {
                    title: 'Kamu Sering Mengklik Link Jahat 🎣',
                    description: 'Ada jejak interaksi dengan website penipu. Mungkin kamu pernah ikut airdrop palsu atau klik link sembarangan di Telegram/Discord.',
                    action: 'Stop klik link hadiah gratisan! Selalu cek URL sebelum connect wallet.'
                },
                clean: {
                    title: 'Dompet Terlihat Aman ✅',
                    description: 'Sejauh ini tidak ada red flag yang signifikan. Pola transaksi terlihat normal dan tidak ada interaksi dengan kontrak berbahaya.',
                    action: 'Tetap waspada dan jangan sembarangan approve kontrak!'
                }
            },
            recommendations: {
                default: '✅ Dompet terlihat aman, tapi tetap DYOR sebelum transaksi besar',
                check: '💡 Selalu double-check alamat kontrak sebelum approve'
            }
        },
        token: {
            risk: {
                critical: '⛔ SANGAT BERISIKO! {count} critical issues ditemukan. HINDARI token ini!',
                high: '⚠️ RISIKO TINGGI. {count} issues ditemukan. Hati-hati!',
                medium: '⚡ Risiko sedang. Beberapa red flags ditemukan. Lakukan riset lebih lanjut.',
                low: '✅ Risiko rendah. Token terlihat cukup aman, tapi tetap DYOR.',
                safe: '✅ Token terlihat aman. Semua security checks passed.',
            },
            checks: {
                verified: {
                    name: 'Verifikasi Kode Smart Contract',
                    verified: 'Kode smart contract sudah diverifikasi dan bisa dibaca publik',
                    unverified: 'Kode smart contract TIDAK diverifikasi - kode tidak bisa dibaca publik (HATI-HATI)',
                    recommendation: 'Cek kode smart contract-nya dulu sebelum invest. Kalo ga verified, JANGAN!'
                },
                honeypot: {
                    name: 'Deteksi Jebakan (Honeypot)',
                    detected: '🚨 JEBAKAN! Token ini bisa dibeli tapi TIDAK BISA DIJUAL. Anda akan kehilangan uang!',
                    safe: 'Aman - Token bisa dibeli dan dijual dengan normal',
                    recommendation: 'JANGAN BELI - Ini jebakan! Anda tidak akan bisa menjual token ini!'
                },
                holders: {
                    name: 'Distribusi Pemegang Token',
                    centralized: 'Pemegang terbesar punya {percent}% token - terlalu banyak di satu orang (RISIKO!)',
                    distributed: 'Distribusi cukup baik - token tersebar merata (pemegang terbesar: {percent}%)'
                },
                liquidity: {
                    name: 'Status Likuiditas (Dana Pool)',
                    locked: 'Dana pool sudah dikunci - developer tidak bisa kabur dengan uang Anda',
                    unlocked: 'Dana pool TIDAK dikunci - developer bisa sewaktu-waktu menguras semua dana (RUG PULL)',
                    recommendation: 'Dana pool tidak dikunci - developer bisa kabur bawa uang Anda. SANGAT HATI-HATI!'
                },
                scamDb: {
                    name: 'Cek Database Penipuan',
                    detected: '🚨 TOKEN INI TERDAFTAR SEBAGAI PENIPUAN! JANGAN BELI!',
                    safe: 'Tidak terdeteksi di database penipuan',
                    recommendation: 'Token ini terdaftar sebagai penipuan. HINDARI 100%!'
                },
                age: {
                    name: 'Umur Token',
                    new: 'Token masih baru ({days} hari) - belum teruji, lebih berisiko',
                    old: 'Token sudah {days} hari - sudah cukup lama dan teruji'
                },
                mint: {
                    name: 'Fungsi Cetak Token Unlimited',
                    detected: 'Pemilik bisa cetak token baru tanpa batas - nilai token bisa anjlok karena kebanyakan',
                    safe: 'Tidak ada fungsi cetak token unlimited - supply aman'
                }
            },
            recommendations: {
                default: 'Token terlihat legitimate, tapi tetap lakukan riset sendiri (DYOR).',
                invest: 'Jangan invest lebih dari yang bisa Anda rugikan.'
            }
        },
        health: {
            factors: {
                noScam: {
                    name: 'Bebas Token Scam',
                    description: '{count} token scam terdeteksi di wallet'
                },
                limitedApprovals: {
                    name: 'Approval Terkontrol',
                    description: 'Tidak ada unlimited approval berbahaya'
                },
                walletAge: {
                    name: 'Umur Wallet',
                    description: 'Wallet berumur {days} hari'
                },
                diversity: {
                    name: 'Diversifikasi Portfolio',
                    description: '{count} token legitimate di wallet'
                },
                noPhishing: {
                    name: 'Tidak Ada Phishing',
                    description: 'Tidak pernah interaksi dengan situs phishing'
                },
                activity: {
                    name: 'Aktivitas Sehat',
                    description: 'Pola transaksi normal seperti manusia'
                }
            },
            achievements: {
                scamAvoider: {
                    name: 'Portfolio Bersih',
                    description: 'Koleksi Anda hanya berisi aset terverifikasi. Anda berhasil menghindari token berisiko.',
                    requirement: 'Tidak ada token berisiko'
                },
                approvalMaster: {
                    name: 'Pengendali Izin',
                    description: 'Anda memegang kendali penuh atas aset Anda. Tidak ada akses unlimited yang diberikan.',
                    requirement: 'Tidak ada izin unlimited'
                },
                ogHolder: {
                    name: 'Akun Senior',
                    description: 'Akun Anda memiliki sejarah 3+ tahun. Anda adalah bagian dari komunitas awal.',
                    requirement: 'Umur akun lebih dari 3 tahun'
                },
                diversified: {
                    name: 'Koleksi Seimbang',
                    description: 'Anda memegang 10+ aset terverifikasi. Strategi manajemen risiko yang baik.',
                    requirement: '10+ aset terverifikasi'
                },
                activeTrader: {
                    name: 'Aktivitas Rutin',
                    description: 'Anda telah menyelesaikan 100+ aksi. Akun Anda menunjukkan penggunaan yang sehat dan konsisten.',
                    requirement: '100+ aktivitas selesai'
                }
            },
            strengths: {
                perfect: '✅ {name} - Sempurna!',
                empty: '⚡ Masih banyak ruang untuk improvement'
            },
            weaknesses: {
                issue: '⚠️ {name} - Perlu perbaikan',
                empty: '🎉 Tidak ada kelemahan signifikan!'
            }
        }
    },
} as const;

export type TranslationKeys = typeof id;
