export default function FeeSummary({ fee, commission }) {
  return (
    <div>
      <p>Fee estimado: {fee} USDC</p>
      <p>Comisión: {commission} USDC</p>
    </div>
  );
}
