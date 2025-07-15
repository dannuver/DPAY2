export default function TxStatus({ status }) {
  if (!status) return null;
  return (
    <div>
      <p>Estado de la transacción: {status}</p>
    </div>
  );
}
