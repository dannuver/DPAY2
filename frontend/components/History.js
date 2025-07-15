export default function History({ items }) {
  if (!items || items.length === 0) return <p>Sin historial.</p>;
  return (
    <div>
      <h3>Historial de transacciones</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
