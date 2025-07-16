"use client";
import { useState } from "react";
import WalletConnect from "../components/WalletConnect";
import BalanceChecker from "../components/BalanceChecker";
import TopUpOption from "../components/TopUpOption";
import ChainSelector from "../components/ChainSelector";
import AssetAmountInput from "../components/AssetAmountInput";
import FeeSummary from "../components/FeeSummary";
import TxStatus from "../components/TxStatus";
import History from "../components/History";

const CHAINS = ["Ethereum", "Polygon", "Avalanche"];
const ASSETS = ["USDC", "ETH", "MATIC"];

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [chain, setChain] = useState("");
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0.5");
  const [commission, setCommission] = useState("0.2");
  const [txStatus, setTxStatus] = useState("");
  const [history, setHistory] = useState([]);

  const handleWalletConnected = (address: string) => {
    setWallet(address);
  };
  const handleBalanceChecked = (bal: string) => {
    setBalance(bal);
    setShowTopUp(bal === "0");
  };
  const handleTopUp = () => {
    setTxStatus("Recarga iniciada vía Axelar...");
    // TODO: Lógica de recarga
  };
  const handleChainSelect = (selected: string) => setChain(selected);
  const handleAssetAmountChange = (type: string, value: string) => {
    if (type === "asset") setAsset(value);
    if (type === "amount") setAmount(value);
  };
  const handleSignAndSend = () => {
    setTxStatus("Transacción enviada a Stellar. Firmando...");
    // TODO: Lógica de firma y envío
    setTimeout(() => {
      setTxStatus("Transacción completada");
      setHistory((h) => [...h, `Tx ${Date.now()} - ${amount} ${asset} en ${chain}`]);
    }, 2000);
  };

  return (
    <div>
      <main>
        <h1>Bienvenido a la DApp Cross-Chain Pagos</h1>
        <WalletConnect onWalletConnected={handleWalletConnected} />
        {wallet && <BalanceChecker address={wallet} onBalanceChecked={handleBalanceChecked} />}
        {showTopUp && <TopUpOption onTopUp={handleTopUp} />}
        <ChainSelector chains={CHAINS} onSelect={handleChainSelect} />
        <AssetAmountInput assets={ASSETS} onChange={handleAssetAmountChange} />
        <FeeSummary fee={fee} commission={commission} />
        <button onClick={handleSignAndSend} disabled={!wallet || !amount || !asset || !chain}>
          Firmar y Enviar
        </button>
        <TxStatus status={txStatus} />
        <History items={history} />
      </main>
    </div>
  );
}
