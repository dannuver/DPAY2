export default function ChainSelector({ chains, onSelect }) {
  return (
    <div>
      <label>Cadena de origen: </label>
      <select onChange={e => onSelect(e.target.value)}>
        <option value="">Seleccione</option>
        {chains.map(chain => (
          <option key={chain} value={chain}>{chain}</option>
        ))}
      </select>
    </div>
  );
}
