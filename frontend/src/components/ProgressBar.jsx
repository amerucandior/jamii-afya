export default function ProgressBar({ value, urgent }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track"><div className={`progress-fill ${urgent ? "urgent" : ""}`} style={{ width: `${value}%` }} /></div>
      <span className={`progress-pct ${urgent ? "urgent" : ""}`}>{value}%</span>
    </div>
  );
}