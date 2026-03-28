export default function CircularProgress({ value, size = 110 }) {
  const r = 44; const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="circ-progress-wrap">
      <svg className="circ-svg" width={size} height={size} viewBox="0 0 100 100">
        <circle className="circ-track" cx="50" cy="50" r={r} strokeWidth="8" />
        <circle className="circ-fill" cx="50" cy="50" r={r} strokeWidth="8" strokeDasharray={c} strokeDashoffset={offset} />
        <text className="circ-label" x="50" y="54" textAnchor="middle" fontSize="18" fontFamily="var(--font-display)" fill="var(--blue)" style={{transform:"rotate(90deg) translateX(-4px)",transformOrigin:"50% 50%"}}>{value}%</text>
      </svg>
    </div>
  );
}