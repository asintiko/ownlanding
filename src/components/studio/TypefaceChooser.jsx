import { useRef } from 'react';
import { Check } from 'lucide-react';

/**
 * Radio group of typeface options. Each row shows a specimen rendered in the
 * candidate family itself, the option's Russian name and its character, so the
 * owner chooses by description as well as by specimen.
 *
 * @param {Object} props
 * @param {string} props.groupLabel      Accessible name of the group.
 * @param {string} props.label           Visible group label.
 * @param {Array<{key: string, label: string, character: string, stack: string}>} props.options
 * @param {string} props.value
 * @param {(key: string) => void} props.onChange
 * @param {string} props.specimenText
 * @param {number} props.specimenSize
 * @param {number} props.specimenWeight
 * @param {boolean} [props.disabled]
 */
export default function TypefaceChooser({
  groupLabel,
  label,
  options,
  value,
  onChange,
  specimenText,
  specimenSize,
  specimenWeight,
  disabled = false,
}) {
  const refs = useRef([]);

  const focusOption = (index) => {
    const next = (index + options.length) % options.length;
    onChange(options[next].key);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event, index) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusOption(index - 1);
    }
  };

  return (
    <div className="admin-typeface-group" role="radiogroup" aria-label={groupLabel}>
      <p className="admin-typeface-group__label" aria-hidden="true">
        {label}
      </p>

      {options.map((option, index) => {
        const selected = option.key === value;
        return (
          <button
            key={option.key}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${option.label}. ${option.character}`}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            className={`admin-typeface-option${
              selected ? ' admin-typeface-option--selected' : ''
            }`}
            onClick={() => onChange(option.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span
              className="admin-typeface-option__specimen"
              style={{
                fontFamily: option.stack,
                fontSize: `${specimenSize}px`,
                fontWeight: specimenWeight,
              }}
            >
              {specimenText}
            </span>

            <span className="admin-typeface-option__meta">
              <span className="admin-typeface-option__name">{option.label}</span>
              <span className="admin-typeface-option__character">{option.character}</span>
            </span>

            {selected ? (
              <Check className="admin-typeface-option__marker" aria-hidden="true" />
            ) : (
              <span className="admin-typeface-option__marker" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
