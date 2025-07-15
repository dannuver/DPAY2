export default function AssetAmountInput({ assets, onChange }) {
  return (
    <div>
      <label>Moneda: </label>
      <select onChange={e => onChange('asset', e.target.value)}>
        <option value="">Seleccione</option>
        {assets.map(asset => (
          <option key={asset} value={asset}>{asset}</option>
        ))}
      </select>
      <label>Monto: </label>
      <input type="number" min="0" onChange={e => onChange('amount', e.target.value)} />
    </div>
  );
}
