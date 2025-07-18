"use client";
import { useState, useEffect } from "react";
import { useStellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import * as StellarSdk from "stellar-sdk";
import BalanceChecker from "../components/BalanceChecker";
import TopUpOption from "../components/TopUpOption";
import ChainSelector from "../components/ChainSelector";
import History from "../components/History";

const CHAINS = ["Ethereum", "Polygon", "Avalanche"];
// USDC es ahora la opción principal, XLM es opcional.
const ASSETS = ["USDC", "XLM"];

// ¡IMPORTANTE! Esta es la dirección del emisor de USDC en la red de pruebas (Testnet) de Stellar.
// Para la red principal (Pubnet), necesitarás una dirección de emisor diferente.
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export default function Home() {
  // Usaremos el kit de Stellar para manejar el estado de la billetera
  const kit = useStellarWalletsKit();

  const [balance, setBalance] = useState<string | null>(null); // Saldo (solo XLM por ahora)
  const [showTopUp, setShowTopUp] = useState(false);
  const [chain, setChain] = useState("");
  const [asset, setAsset] = useState(ASSETS[0]); // USDC como activo por defecto
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0.5"); // Simulado
  const [commission, setCommission] = useState("0.2"); // Simulado
  const [txStatus, setTxStatus] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const handleWalletConnected = (address: string) => {
    // Ya no es necesario, el kit maneja la conexión
  };
  const handleBalanceChecked = (bal: string) => {
    setBalance(bal);
    // Mostrar opción de recarga si el saldo de XLM es 0.
    // NOTA: Esto no comprueba el saldo de USDC.
    setShowTopUp(bal === "0" || bal === null);
  };
  const handleTopUp = () => {
    setTxStatus("La función de recarga desde otras cadenas aún no está implementada.");
    // TODO: Implementar la lógica de recarga con Axelar.
    // Esto implicaría conectar una billetera EVM (con wagmi/ethers) y llamar al SDK de Axelar.
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
      // 1. Conectar al servidor de Testnet de Stellar
      const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

      // 2. Cargar la cuenta de origen para obtener su estado actual (ej. número de secuencia)
      const sourceAccount = await server.loadAccount(kit.publicKey);
      setTxStatus("Cuenta cargada. Por favor, firma la transacción en tu billetera.");

      // TODO: Reemplazar con la dirección de destino real
      const destination = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

      // 3. Crear el objeto del activo a enviar (XLM nativo o un token como USDC)
      const assetToSend =
        asset === "XLM"
          ? StellarSdk.Asset.native() // Activo nativo de Stellar
          : new StellarSdk.Asset(asset, USDC_ISSUER_TESTNET); // Token USDC con su emisor

      // 4. Construir la transacción
      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100", // La tarifa base en stroops (0.00001 XLM)
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

      // 5. Firmar la transacción usando el kit de billetera
      const signedTx = await kit.signTx({ transaction: tx, network: "TESTNET" });
      setTxStatus("Transacción firmada, enviando a la red...");

      // 6. Enviar la transacción firmada a la red Stellar
      const result = await server.submitTransaction(signedTx.result);
      setTxStatus(`¡Transacción completada! Hash: ${result.hash.substring(0, 12)}...`);
      setHistory((h) => [...h, `Tx ${result.hash.substring(0, 12)}... - ${amount} ${asset}`]);
    } catch (error: any) {
      console.error("Error al firmar o enviar la transacción:", error);
      // Dar un mensaje más útil en caso de error de "trustline"
      if (error?.response?.data?.extras?.result_codes?.operations?.includes('op_no_trust')) {
        setTxStatus("Error: La cuenta de destino no confía en el emisor de USDC. Se necesita una 'trustline'.");
      } else {
        setTxStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <main style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>DPAY2 - Pagos Cross-Chain</h1>

        {/* Sección de Conexión de Billetera */}
        <div style={{ marginBottom: '1.5rem' }}>
          {kit.publicKey ? (
            <div>
              <p>Conectado: <code style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px' }}>{`${kit.publicKey.substring(0, 8)}...${kit.publicKey.substring(48)}`}</code></p>
              <button onClick={() => kit.signOut()} style={{ marginTop: '0.5rem' }}>Desconectar</button>
            </div>
          ) : (
            <button onClick={() => kit.openModal()}>Conectar Billetera Stellar</button>
          )}
        </div>

        {/* Muestra el saldo y la opción de recarga solo si la billetera está conectada */}
        {kit.publicKey && (
          <div style={{ marginBottom: '1.5rem' }}>
            <BalanceChecker address={kit.publicKey} onBalanceChecked={handleBalanceChecked} />
            {showTopUp && <TopUpOption onTopUp={handleTopUp} />}
          </div>
        )}

        {/* Formulario de Pago */}
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Realizar un Pago en Stellar</h2>
          <ChainSelector chains={CHAINS} onSelect={handleChainSelect} />
          <AssetAmountInput assets={ASSETS} onChange={handleAssetAmountChange} />
          <FeeSummary fee={fee} commission={commission} />
          <button
            onClick={handleSignAndSend}
            disabled={!kit.publicKey || !amount || !asset}
            style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', cursor: (!kit.publicKey || !amount || !asset) ? 'not-allowed' : 'pointer' }}
          >
            Firmar y Enviar
          </button>
        </div>

        {/* Estado e Historial de Transacciones */}
        <div style={{ marginTop: '1.5rem' }}>
          <TxStatus status={txStatus} />
          <History items={history} />
        </div>
      </main>
    </div>
  );

