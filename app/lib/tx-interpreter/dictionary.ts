// Translation dictionary - Technical warnings to human language (Bahasa Indonesia)

import { WarningContext, TranslatedWarning } from './types';

export const TRANSLATION_DICTIONARY: Record<WarningContext, TranslatedWarning> = {
    UNLIMITED_APPROVAL: {
        title: '🔓 Izin Penuh (Unlimited Approval)',
        explanation: 'Anda memberikan izin kepada kontrak ini untuk menggunakan **seluruh saldo token Anda** tanpa batas.',
        impact: 'Selama izin ini aktif, kontrak dapat memindahkan token Anda kapan saja tanpa meminta konfirmasi tambahan. Izin ini tetap berlaku sampai Anda mencabutnya secara manual.',
        severity: 'warning' as const
    },

    LIMITED_APPROVAL: {
        title: '🔐 Izin Terbatas',
        explanation: 'Anda memberikan izin kepada kontrak untuk menggunakan **sejumlah tertentu** token Anda.',
        impact: 'Kontrak hanya dapat menggunakan token sebesar yang Anda izinkan. Setelah jumlah tersebut habis, kontrak harus meminta izin lagi.',
        severity: 'caution' as const
    },

    UNVERIFIED_CONTRACT: {
        title: '❓ Kontrak Belum Terverifikasi',
        explanation: 'Kode kontrak ini **belum diverifikasi** di block explorer.',
        impact: 'Anda tidak dapat melihat kode sumber kontrak ini secara publik. Tidak ada cara untuk memastikan apa yang akan dilakukan kontrak ini dengan aset Anda.',
        severity: 'warning' as const
    },

    HIGH_VALUE_TRANSFER: {
        title: '💰 Transfer Nilai Tinggi',
        explanation: 'Transaksi ini mentransfer **jumlah yang besar** dari dompet Anda.',
        impact: 'Pastikan alamat penerima dan jumlah sudah benar. Transaksi blockchain tidak dapat dibatalkan setelah dikonfirmasi.',
        severity: 'caution' as const
    },

    BROAD_PERMISSIONS: {
        title: '🔑 Izin Luas',
        explanation: 'Signature ini memberikan **berbagai izin** kepada aplikasi atau kontrak.',
        impact: 'Aplikasi mungkin dapat melakukan beberapa tindakan atas nama Anda. Baca dengan teliti apa saja yang diminta.',
        severity: 'caution' as const
    },

    SIGNATURE_REQUEST: {
        title: '✍️ Permintaan Tanda Tangan',
        explanation: 'Aplikasi meminta Anda untuk **menandatangani pesan** (bukan transaksi).',
        impact: 'Tanda tangan ini biasanya untuk login atau verifikasi identitas. Tidak langsung memindahkan aset, tapi bisa memberikan akses ke aplikasi.',
        severity: 'info' as const
    },

    UNKNOWN_FUNCTION: {
        title: '⚠️ Fungsi Tidak Dikenal',
        explanation: 'Transaksi ini memanggil **fungsi yang tidak dikenali** pada kontrak.',
        impact: 'Tidak ada informasi tentang apa yang dilakukan fungsi ini. Lanjutkan dengan hati-hati atau verifikasi kontrak secara manual.',
        severity: 'warning' as const
    }
};

// Common ERC20 function signatures
export const KNOWN_FUNCTION_SIGNATURES: Record<string, { name: string; type: string }> = {
    '0x095ea7b3': { name: 'approve', type: 'APPROVAL' },
    '0xa9059cbb': { name: 'transfer', type: 'TRANSACTION' },
    '0x23b872dd': { name: 'transferFrom', type: 'TRANSACTION' },
    '0xd505accf': { name: 'permit', type: 'PERMIT' },
};

// Unlimited approval detection
export const UNLIMITED_APPROVAL_AMOUNTS = [
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', // 2^256 - 1
    '115792089237316195423570985008687907853269984665640564039457584007913129639935', // decimal
];

export function isUnlimitedApproval(amount: string): boolean {
    const normalized = amount.toLowerCase().replace('0x', '');
    return UNLIMITED_APPROVAL_AMOUNTS.some(unlimited => {
        const normalizedUnlimited = unlimited.toLowerCase().replace('0x', '');
        return normalized === normalizedUnlimited;
    });
}
