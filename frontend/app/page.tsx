"use client";
import { useState, useEffect } from "react";
import { useStellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import * as StellarSdk from "stellar-sdk";
import BalanceChecker from "../components/BalanceChecker";
import TopUpOption from "../components/TopUpOption";
import ChainSelector from "../components/ChainSelector";
import AssetAmountInput from "../components/AssetAmountInput";
import FeeSummary from "../components/FeeSummary";
import TxStatus from "../components/TxStatus";
import History from "../components/History";

const CHAINS = ["Ethereum", "Polygon", "Avalanche"];
const ASSETS = ["USDC", "XLM"];
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

interface Transaction {
  hash: string;
  amount: string;
  asset: string;
  timestamp: number;
}

export default function Home() {
  const kit = useStellarWalletsKit();

  const [balances, setBalances] = useState<{ xlm: string; usdc: string } | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [chain, setChain] = useState(CHAINS[0]);
  const [asset, setAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0.5");
  const [commission, setCommission] = useState("0.2");
  const [txStatus, setTxStatus] = useState("");
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("dpay2-tx-history");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleBalanceChecked = (newBalances: { xlm: string; usdc: string }) => {
    setBalances(newBalances);
    setShowTopUp(parseFloat(newBalances.xlm) < 1.5);
  };

  const handleTopUp = () => {
    setTxStatus("La función de recarga desde otras cadenas aún no está implementada.");
  };

  const handleChainSelect = (selected: string) => setChain(selected);

  const handleAssetAmountChange = (type: string, value: string) => {
    if (type === "asset") setAsset(value);
    if (type === "amount") setAmount(value);
  };

  const handleSignAndSend = async () => {
    if (!kit.publicKey || !amount || !asset) {
      setTxStatus("Por favor, conecta tu billetera e ingresa un monto y un activo.");
      return;
    }

    setTxStatus("Preparando la transacción...");
    try {
      const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
      const sourceAccount = await server.loadAccount(kit.publicKey);
      setTxStatus("Cuenta cargada. Por favor, firma la transacción en tu billetera.");

      const destination = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

      const assetToSend =
        asset === "XLM"
          ? StellarSdk.Asset.native()
          : new StellarSdk.Asset(asset, USDC_ISSUER_TESTNET);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination,
            asset: assetToSend,
            amount,
          })
        )
        .setTimeout(30)
        .build();

      const signedTx = await kit.signTx({ transaction: tx, network: "TESTNET" });
      setTxStatus("Transacción firmada, enviando a la red...");

      const result = await server.submitTransaction(signedTx.result);
      const newTx: Transaction = {
        hash: result.hash,
        amount,
        asset,
        timestamp: Date.now(),
      };
      const newHistory = [newTx, ...history];
      setHistory(newHistory);
      setTxStatus(`¡Transacción completada! Hash: ${result.hash.substring(0, 12)}...`);
      localStorage.setItem("dpay2-tx-history", JSON.stringify(newHistory));
    } catch (error: any) {
      console.error("Error al firmar o enviar la transacción:", error);
      if (error?.response?.data?.extras?.result_codes?.operations?.includes("op_no_trust")) {
        setTxStatus("Error: La cuenta de destino no confía en el emisor de USDC. Se necesita una 'trustline'.");
      } else {
        setTxStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <main style={{ padding: "2rem", maxWidth: "600px", margin: "auto", fontFamily: "sans-serif" }}>
        <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>DPAY2 - Pagos Cross-Chain</h1>

        <div style={{ marginBottom: "1.5rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
          {kit.publicKey ? (
            <div>
              <p>Conectado: <code style={{ background: "#eee", padding: "2px 4px", borderRadius: "4px" }}>{`${kit.publicKey.substring(0, 8)}...${kit.publicKey.substring(48)}`}</code></p>
              <BalanceChecker address={kit.publicKey} onBalanceChecked={handleBalanceChecked} />
              <button onClick={() => kit.signOut()} style={{ marginTop: "0.5rem" }}>Desconectar</button>
            </div>
          ) : (
            <button onClick={() => kit.openModal()} style={{ width: "100%", padding: "0.75rem" }}>Conectar Billetera Stellar</button>
          )}
        </div>

        {showTopUp && <TopUpOption onTopUp={handleTopUp} />}

        <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "1rem" }}>Realizar un Pago en Stellar</h2>
          <ChainSelector chains={CHAINS} onSelect={handleChainSelect} />
          <AssetAmountInput assets={ASSETS} onChange={handleAssetAmountChange} />
          <FeeSummary fee={fee} commission={commission} />
          <button
            onClick={handleSignAndSend}
            disabled={!kit.publicKey || !amount || !asset}
            style={{ width: "100%", padding: "0.75rem", marginTop: "1rem", cursor: !kit.publicKey || !amount || !asset ? "not-allowed" : "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
          >
            Firmar y Enviar
          </button>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <TxStatus status={txStatus} />
          <History
            items={history.map(tx => `Tx: ${tx.hash.substring(0, 12)}... - ${tx.amount} ${tx.asset}`)}
          />
        </div>
      </main>
    </div>
  );
}

