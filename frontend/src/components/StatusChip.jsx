export default function StatusChip({ status }) {
  return <span className={`chip chip-${status}`}><span className="chip-dot" />{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}