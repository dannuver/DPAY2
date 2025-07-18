"use client";

import { useState, useEffect, FC } from 'react';
import * as StellarSdk from "stellar-sdk";

interface BalanceCheckerProps {
  address: string;
  onBalanceChecked: (balances: { xlm: string; usdc: string }) => void;
}

const BalanceChecker: FC<BalanceCheckerProps> = ({ address, onBalanceChecked }) => {
  const [balances, setBalances] = useState<{ xlm: string; usdc: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBalance = async () => {
      setLoading(true);
      setError(null);
      setBalances(null);
      const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
      const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

      try {
        const account = await server.loadAccount(address);
        const xlmBalance = account.balances.find(b => b.asset_type === 'native')?.balance ?? '0';
        const usdcBalance = account.balances.find(b => b.asset_type !== 'native' && b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER_TESTNET)?.balance ?? '0';
        const newBalances = { xlm: xlmBalance, usdc: usdcBalance };
        setBalances(newBalances);
        onBalanceChecked(newBalances);
      } catch (err: any) {
        // Un error 404 es normal para una cuenta nueva sin fondos
        if (err?.response?.status === 404) {
          const zeroBalances = { xlm: '0', usdc: '0' };
          setBalances(zeroBalances);
          onBalanceChecked(zeroBalances);
        } else {
          console.error("Error al obtener el saldo de Stellar:", err);
          setError("No se pudo obtener el saldo.");

  return (
    <div>
      {loading && <p>Consultando saldos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {balances && !loading && (
        <>
          <p>Saldo: {parseFloat(balances.xlm).toFixed(4)} XLM</p>
          <p>Saldo: {parseFloat(balances.usdc).toFixed(4)} USDC</p>
        </>
      )}
    </div>
  );
};

