'use client';

import { useField } from '@payloadcms/ui';
import type { TextFieldClientProps } from 'payload';
import { useId } from 'react';

export function ColorField({ path, field, readOnly }: TextFieldClientProps) {
  const { value, setValue, showError, errorMessage, disabled } = useField<string>({ potentiallyStalePath: path });
  const id = useId();
  const label = typeof field.label === 'string' ? field.label : field.label && typeof field.label === 'object' ? field.label.ru || field.label.en || 'Цвет' : 'Цвет';
  const valid = /^#[\da-f]{6}([\da-f]{2})?$/i.test(value || '');
  const rgb = valid ? value.slice(0, 7) : '#000000';
  const alpha = valid && value.length === 9 ? parseInt(value.slice(7, 9), 16) : 255;
  const opacity = Math.round(alpha / 255 * 100);
  const inactive = readOnly || disabled;

  return <div className="waka-color-field field-type">
    <label className="field-label" htmlFor={`${id}-color`}>{label}</label>
    <div className="waka-color-field__controls">
      <input id={`${id}-color`} type="color" value={rgb} disabled={inactive} onChange={(event) => setValue(event.target.value + (alpha < 255 ? alpha.toString(16).padStart(2, '0') : ''))} />
      <div className="waka-color-field__opacity">
        <label htmlFor={`${id}-opacity`}>Прозрачность <span>{100 - opacity}%</span></label>
        <input id={`${id}-opacity`} type="range" min="0" max="100" step="1" value={100 - opacity} disabled={inactive} onChange={(event) => {
          const nextAlpha = Math.round((100 - Number(event.target.value)) * 255 / 100);
          setValue(rgb + (nextAlpha < 255 ? nextAlpha.toString(16).padStart(2, '0') : ''));
        }} />
      </div>
    </div>
    <details className="waka-color-field__exact"><summary>Точный цвет</summary><label className="waka-sr-only" htmlFor={`${id}-hex`}>Код цвета: {label}</label><input id={`${id}-hex`} type="text" value={value || ''} placeholder="#RRGGBB" maxLength={9} spellCheck={false} disabled={inactive} onChange={(event) => setValue(event.target.value)} /><p>Код из 6 или 8 символов после #, например #ffffff.</p></details>
    {showError && <p className="waka-field-error" role="alert">{errorMessage}</p>}
  </div>;
}
