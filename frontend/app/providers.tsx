"use client";

import { StellarWalletsKit, WalletNetwork } from "@creit.tech/stellar-wallets-kit";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StellarWalletsKit
      // Elige la red de Stellar (PUBNET o TESTNET)
      network={WalletNetwork.TESTNET}
      // El nombre de tu aplicación que se mostrará en la billetera
      appName="DPAY2 Cross-Chain"
    >
      {children}
    </StellarWalletsKit>
  );
}
