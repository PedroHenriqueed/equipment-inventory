export default function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider"></span>
      <span className="toggle-label">{label}</span>
    </label>
  );
}
