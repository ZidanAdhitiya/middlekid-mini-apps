import { NextRequest, NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse } from '../../lib/types/chat';

// Demo mode responses when agent is not configured
const DEMO_RESPONSES: Record<string, string> = {
    'default': 'Halo! Saya Kid, asisten AI untuk Middlekid. 👋\n\nSaat ini saya berjalan dalam mode demo karena Python agent belum dikonfigurasi.\n\nUntuk mengaktifkan fitur lengkap:\n1. Deploy Python agent ke Cloud Run\n2. Tambahkan GOODKID_AGENT_URL ke environment variables\n\nLihat file `python-agent/README.md` untuk panduan deployment.',
    'help': 'Middlekid adalah aplikasi portfolio tracker untuk Base chain yang membantu Anda:\n\n💰 Track token holdings\n🖼️ View NFT collections\n📊 Monitor DeFi positions\n⚡ Real-time portfolio analytics\n\nMasukkan wallet address di search bar untuk memulai!',
    'defi': 'DeFi Positions menampilkan posisi DeFi Anda seperti:\n\n• Staking positions\n• Liquidity pool positions\n• Lending/borrowing positions\n\nAnda bisa melihatnya di tab "DeFi" setelah memasukkan wallet address.',
    'token': 'Untuk menganalisis token, saya perlu full agent deployment.\n\nDalam mode lengkap, saya bisa:\n• Cek keamanan smart contract\n• Analisis risiko token\n• Deteksi honeypot\n• Review tokenomics\n\nDeploy Python agent untuk fitur ini!',
};

function getDemoResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('help') || lowerMessage.includes('cara') || lowerMessage.includes('bagaimana')) {
        return DEMO_RESPONSES.help;
    }
    if (lowerMessage.includes('defi') || lowerMessage.includes('staking')) {
        return DEMO_RESPONSES.defi;
    }
    if (lowerMessage.includes('token') || lowerMessage.includes('analisis') || lowerMessage.includes('kontrak')) {
        return DEMO_RESPONSES.token;
    }

    return DEMO_RESPONSES.default;
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequest = await req.json();
        const { message, conversationHistory } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Message is required' } as ChatResponse,
                { status: 400 }
            );
        }

        // Get the Python agent endpoint URL from environment variable
        const agentUrl = process.env.GOODKID_AGENT_URL;

        if (!agentUrl) {
            console.warn('GOODKID_AGENT_URL is not configured - using demo mode');

            // Return demo response instead of error
            return NextResponse.json({
                success: true,
                response: getDemoResponse(message),
            } as ChatResponse);
        }

        // Forward the message to the Python agent
        const agentResponse = await fetch(agentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                conversationHistory: conversationHistory?.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
            }),
            // 30 second timeout
            signal: AbortSignal.timeout(30000),
        });

        if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            console.error('Agent response error:', agentResponse.status, errorText);
            throw new Error(`Agent returned status ${agentResponse.status}`);
        }

        const agentData = await agentResponse.json();

        return NextResponse.json({
            success: true,
            response: agentData.response || agentData.message || 'No response from agent',
        } as ChatResponse);
    } catch (error: any) {
        console.error('Chat API error:', error);

        // Handle specific error types
        if (error.name === 'AbortError') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Request timeout. Please try again.',
                } as ChatResponse,
                { status: 504 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to get response from AI agent',
            } as ChatResponse,
            { status: 500 }
        );
    }
}
