import { useState, useEffect } from 'react';
import StellarSdk from 'stellar-sdk';

// Utilidad para generar un SEP-7 URI para firma de transacciones
function generateSep7Uri({ xdr, callback }) {
  return `web+stellar:tx?xdr=${encodeURIComponent(xdr)}&callback=${encodeURIComponent(callback)}`;
}

// Utilidad para iniciar autenticación SEP-10 usando el anchor de @creit.tech
async function startSep10Auth(publicKey) {
  const res = await fetch(`https://anchor.creit.tech/auth?account=${publicKey}`);
  const { transaction } = await res.json();
  return transaction;
}

function openSep24Widget(interactiveUrl) {
  window.open(interactiveUrl, '_blank', 'width=420,height=720');
}

export default function WalletConnect({ onWalletConnected }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [showAxelar, setShowAxelar] = useState(false);
  const [axelarAmount, setAxelarAmount] = useState('');
  const [axelarFee, setAxelarFee] = useState(0.15);
  const [axelarStatus, setAxelarStatus] = useState('');
  const [sep10Token, setSep10Token] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('sep10Token');
      if (token) setSep10Token(token);
    }
  }, []);
  const [sep7Uri, setSep7Uri] = useState('');
  const [sep24Url, setSep24Url] = useState('');
  const [showPuntoRed, setShowPuntoRed] = useState(false);
  const [step, setStep] = useState('main');
  const [memo, setMemo] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [fees, setFees] = useState({ stellar: 0.0001, creit: 0.25, puntored: 0.5, axelar: 0.1 });
  const [totalFee, setTotalFee] = useState(0);

  const USDC_ISSUER = 'GA5ZSE7V3YFQJYQJZQFQJYQJZQFQJYQJZQFQJYQJZQFQJYQJZQFQJYQJZQFQJYQJZ';
  const USDC_CODE = 'USDC';

  const handleConnect = async () => {
    const pubkey = 'GABCD1234EXAMPLEPUBLICKEY';
    setAddress(pubkey);
    onWalletConnected && onWalletConnected(pubkey);
    try {
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(pubkey);
      const usdcBalance = account.balances.find(b => b.asset_code === USDC_CODE && b.asset_issuer === USDC_ISSUER);
      setBalance(usdcBalance ? parseFloat(usdcBalance.balance) : 0);
    } catch (e) {
      setBalance(0);
    }
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('sep10Token');
      if (token) setSep10Token(token);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setBalance(null);
    setSep10Token('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('sep10Token');
    }
    setStep('main');
    setShowAxelar(false);
    setShowPuntoRed(false);
    setTxStatus('');
  };

  const handleSep10 = async () => {
    if (!address) return;
    const challengeTx = await startSep10Auth(address);
    setSep7Uri(generateSep7Uri({ xdr: challengeTx, callback: 'https://anchor.creit.tech/auth/callback' }));
    setTimeout(() => {
      const fakeToken = 'FAKE_SEP10_TOKEN_' + Math.random().toString(36).slice(2);
      setSep10Token(fakeToken);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sep10Token', fakeToken);
      }
      setTxStatus('Autenticación SEP-10 completada. Token seguro.');
    }, 2000);
  };

  const handleSep24 = () => {
    const url = 'https://anchor.creit.tech/interactive/withdraw?token=' + sep10Token;
    setSep24Url(url);
    openSep24Widget(url);
    setStep('sep24');
    setTimeout(() => {
      setShowPuntoRed(true);
      setStep('puntored');
    }, 2000);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    const total = Number(val) + fees.stellar + fees.creit + fees.puntored + fees.axelar;
    setTotalFee(total);
  };

  // Simulación de pago PuntoRed
  const handlePuntoRedPay = () => {
    if (!amount || Number(amount) <= 0) {
      setTxStatus('El monto debe ser mayor a 0.');
      return;
    }
    if (!memo) {
      setTxStatus('El memo es obligatorio.');
      return;
    }
    if (balance < totalFee) {
      setTxStatus('Saldo insuficiente para cubrir el pago y las comisiones.');
      return;
    }
    setTxStatus('Procesando pago en PuntoRed...');
    setTimeout(() => {
      setTxStatus('Pago aprobado en PuntoRed.');
      setBalance(balance - totalFee);
    }, 2000);
  };

  return (
    <div style={{ padding: 24, borderRadius: 16, background: '#f9fafb', boxShadow: '0 4px 12px #ddd' }}>
      {!address ? (
        <button
          onClick={handleConnect}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(90deg,#6366f1 60%,#a5b4fc 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 17,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #6366f155',
          }}
        >
          Conectar Wallet (Fake)
        </button>
      ) : null}

      {address && balance !== null ? (
        <div style={{ marginTop: 12, textAlign: 'center', color: balance > 0 ? '#059669' : '#ef4444', fontWeight: 600, fontSize: 17 }}>
          <span>Saldo disponible:</span> <span style={{ fontWeight: 700 }}>{balance} USDC</span>
        </div>
      ) : null}

      {address && balance === 0 && !showAxelar ? (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 16 }}>No tienes saldo USDC suficiente.</span>
          <button
            onClick={() => setShowAxelar(true)}
            style={{
              marginTop: 14,
              padding: '12px 0',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg,#6366f1 60%,#a5b4fc 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #6366f155',
            }}
          >
            Recargar USDC desde otra red (Axelar)
          </button>
        </div>
      ) : null}

      {address && showAxelar ? (
        <div style={{ marginTop: 32, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg,#e0e7ff 80%,#f8fafc 100%)', boxShadow: '0 2px 12px #6366f122' }}>
          <h3 style={{ color: '#3730a3', marginBottom: 14, fontWeight: 700 }}>Recargar USDC vía Axelar</h3>
          <input
            type="number"
            placeholder="Monto a transferir (USDC)"
            value={axelarAmount}
            min={1}
            onChange={e => setAxelarAmount(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #6366f1', marginBottom: 10, fontSize: 16 }}
          />
          <div style={{ marginBottom: 10, color: '#6366f1', fontWeight: 600, fontSize: 16 }}>
            <span>Fee Axelar: {axelarFee} USDC</span><br />
            <span style={{ fontWeight: 700 }}>Total: {Number(axelarAmount) + axelarFee} USDC</span>
          </div>
          <button
            onClick={() => {
              if (!axelarAmount || Number(axelarAmount) <= 0) {
                setAxelarStatus('El monto debe ser mayor a 0.');
                return;
              }
              setAxelarStatus('Firmando y procesando transacción...');
              setTimeout(() => {
                setAxelarStatus('USDC recibidos en Stellar.');
                setBalance(Number(axelarAmount));
                setShowAxelar(false);
              }, 2500);
            }}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg,#6366f1 60%,#a5b4fc 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #6366f155',
              marginTop: 10,
            }}
          >
            Firmar y transferir USDC
          </button>
          <button
            onClick={() => setShowAxelar(false)}
            style={{
              marginTop: 14,
              padding: '10px 28px',
              borderRadius: 10,
              border: 'none',
              background: '#a5b4fc',
              color: '#3730a3',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #a5b4fc55',
            }}
          >
            ← Regresar
          </button>
          {axelarStatus ? (
            <div style={{ marginTop: 14, color: axelarStatus.includes('recibidos') ? '#059669' : '#f59e42', fontWeight: 700, fontSize: 16 }}>
              {axelarStatus}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          onClick={handleSep24}
          disabled={!sep10Token}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            background: !sep10Token ? '#a5b4fc' : 'linear-gradient(90deg,#6366f1 60%,#a5b4fc 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 17,
            cursor: !sep10Token ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 12px #6366f155',
            opacity: !sep10Token ? 0.7 : 1,
          }}
        >
          Iniciar retiro interactivo SEP-24
        </button>
        {sep24Url ? (
          <span style={{ display: 'block', marginTop: 10, color: '#3730a3', fontWeight: 700, fontSize: 16 }}>
            Widget de retiro abierto en nueva ventana
          </span>
        ) : null}
      </div>

      {address && step === 'sep24' ? (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <span style={{ color: '#3730a3', fontWeight: 700, fontSize: 16 }}>Widget SEP-24 abierto...</span>
          <button
            onClick={() => { setStep('main'); setShowPuntoRed(false); }}
            style={{
              marginTop: 18,
              padding: '10px 28px',
              borderRadius: 10,
              border: 'none',
              background: '#a5b4fc',
              color: '#3730a3',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #a5b4fc55',
            }}
          >
            ← Regresar
          </button>
        </div>
      ) : null}

      {address && step === 'puntored' && showPuntoRed ? (
        <div style={{ marginTop: 32, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg,#f3f4f6 80%,#e0e7ff 100%)', boxShadow: '0 2px 12px #a5b4fc22' }}>
          <h3 style={{ color: '#3730a3', marginBottom: 14, fontWeight: 700 }}>Pago en PuntoRed</h3>
          <input
            type="number"
            placeholder="Monto a pagar (USDC)"
            value={amount}
            min={1}
            onChange={handleAmountChange}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #a5b4fc', marginBottom: 10, fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="Memo de la transacción (obligatorio)"
            value={memo}
            maxLength={28}
            onChange={e => setMemo(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #a5b4fc', marginBottom: 10, fontSize: 16 }}
          />
          <div style={{ marginBottom: 10, color: '#6366f1', fontWeight: 600, fontSize: 16 }}>
            <span>Fee Stellar: {fees.stellar} USDC</span><br />
            <span>Fee Creit: {fees.creit} USDC</span><br />
            <span>Fee PuntoRed: {fees.puntored} USDC</span><br />
            <span>Fee Axelar: {fees.axelar} USDC</span><br />
            <span style={{ fontWeight: 700 }}>Total con fees: {totalFee} USDC</span>
          </div>
          <button
            onClick={handlePuntoRedPay}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(90deg,#6366f1 60%,#a5b4fc 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #6366f155',
              marginTop: 10,
            }}
          >
            Pagar en PuntoRed
          </button>
          <button
            onClick={() => setStep('main')}
            style={{
              marginTop: 14,
              padding: '10px 28px',
              borderRadius: 10,
              border: 'none',
              background: '#a5b4fc',
              color: '#3730a3',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #a5b4fc55',
            }}
          >
            ← Regresar
          </button>
          {txStatus ? (
            <div style={{ marginTop: 14, color: txStatus.includes('aprobado') ? '#059669' : '#f59e42', fontWeight: 700, fontSize: 16 }}>
              Estado: {txStatus}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}