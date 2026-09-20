export const VIEWPORT_PRESETS = [
  { key: 'phone', label: 'Телефон', width: 390 },
  { key: 'tablet', label: 'Планшет', width: 768 },
  { key: 'wide', label: 'Широкий', width: 1180 },
];

/**
 * Radio group of preview widths. Each segment pairs its Russian label with the
 * real pixel width it renders, and the active segment is a filled rectangle
 * with its own boundary — never a colour-only difference.
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {(key: string) => void} props.onChange
 */
export default function ViewportPresetSwitch({ value, onChange }) {
  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (index + 1) % VIEWPORT_PRESETS.length;
      onChange(VIEWPORT_PRESETS[next].key);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (index - 1 + VIEWPORT_PRESETS.length) % VIEWPORT_PRESETS.length;
      onChange(VIEWPORT_PRESETS[prev].key);
    }
  };

  return (
    <div className="admin-presets" role="radiogroup" aria-label="Ширина предпросмотра">
      {VIEWPORT_PRESETS.map((preset, index) => {
        const active = preset.key === value;
        return (
          <button
            key={preset.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${preset.label}, ${preset.width} пикселей`}
            tabIndex={active ? 0 : -1}
            className={`admin-preset${active ? ' admin-preset--active' : ''}`}
            onClick={() => onChange(preset.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {preset.label}
            <span className="admin-preset__width">{preset.width}</span>
          </button>
        );
      })}
    </div>
  );
}
