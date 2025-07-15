import { useEffect, useState } from 'react';
import StellarSdk from 'stellar-sdk';

export default function BalanceChecker({ address, onBalanceChecked }) {
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    if (!address) return;
    const server = new StellarSdk.Server('https://horizon.stellar.org');
    server.loadAccount(address)
      .then(account => {
        const usdc = account.balances.find(b => b.asset_code === 'USDC');
        setBalance(usdc ? usdc.balance : '0');
        onBalanceChecked && onBalanceChecked(usdc ? usdc.balance : '0');
      })
      .catch(() => setBalance('0'));
  }, [address]);
  if (!address) return null;
  return (
    <div>
      <p>Saldo USDC: {balance !== null ? balance : 'Cargando...'}</p>
    </div>
  );
}
