# Wallet Connect Setup Guide

## Prerequisites

Before you can use the Wallet Connect feature, you need to:

1. **Get WalletConnect Project ID**
   - Go to https://cloud.reown.com
   - Create a free account
   - Create a new project
   - Copy your Project ID

2. **Update Environment Variables**
   - Add to your `.env.local` file:
     ```
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
     ```

## Features Implemented

### 1. Wallet Provider (`app/components/WalletProvider.tsx`)
- Configured with Base and Base Sepolia networks
- Supports MetaMask, WalletConnect, and Coinbase Wallet
- Dark theme with green accent (#10b981)

### 2. Connect Wallet Button (`app/components/ConnectWalletButton.tsx`)
- Shows "Connect Wallet" when disconnected
- Shows abbreviated address when connected (e.g., "0x1234...5678")
- Green pulsing indicator when connected

### 3. Auto-Analyze Feature
- When wallet is connected, automatically:
  - Pre-fills the address in search field
  - Triggers Time Machine Analysis
  - Shows "Analyzing YOUR wallet" banner

## Usage

### Wrap App with WalletProvider

In `app/layout.tsx`:
```typescript
import { WalletProvider } from './components/WalletProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
```

### Add Connect Button to Navigation

```typescript
import { ConnectWalletButton } from './components/ConnectWalletButton';

<header>
  <ConnectWalletButton />
</header>
```

## Networks Configured

- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia Testnet** (Chain ID: 84532) - Default for testing

## Next Steps

1. Get WalletConnect Project ID from cloud.reown.com
2. Add to .env.local
3. Wrap app with WalletProvider
4. Add ConnectWalletButton to header/navigation
5. Test connection with MetaMask or other supported wallets

## Testing

Once configured, you can:
1. Click "Connect Wallet" button
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Approve connection in your wallet
4. See your address displayed
5. Navigate to /interpreter to see auto-analysis

## Troubleshooting

**"Invalid Project ID" error:**
- Make sure you've added the correct Project ID from cloud.reown.com
- Make sure it's in `.env.local` with correct variable name
- Restart dev server after adding env variables

**Wallet not connecting:**
- Check network is supported (Base or Base Sepolia)
- Clear browser cache
- Try different wallet provider
- Check browser console for errors
