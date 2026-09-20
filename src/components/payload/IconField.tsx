'use client';

import { useField } from '@payloadcms/ui';
import type { TextFieldClientProps } from 'payload';
import { useId, useMemo, useRef, useState } from 'react';
import { ICON_CATALOG, ICON_GROUPS, searchIcons } from '../../lib/iconCatalog.js';
import { CONTENT_ICONS } from '../icons/glyphs.jsx';

export function IconField({ path, readOnly }: TextFieldClientProps) {
  const { value, setValue, showError, errorMessage, disabled } = useField<string>({ potentiallyStalePath: path });
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = ICON_CATALOG.find((icon) => icon.key === value);
  const Glyph = CONTENT_ICONS[value as keyof typeof CONTENT_ICONS] || CONTENT_ICONS.link;
  const matches = useMemo(() => searchIcons(query).filter((icon) => group === 'all' || icon.group === group), [query, group]);

  function close() {
    setExpanded(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="waka-icon-field field-type">
      <label className="field-label" htmlFor={`${id}-trigger`}>Иконка кнопки</label>
      <button ref={triggerRef} id={`${id}-trigger`} type="button" className="waka-icon-field__trigger" disabled={readOnly || disabled} aria-expanded={expanded} aria-controls={`${id}-catalog`} onClick={() => setExpanded(!expanded)}>
        <Glyph aria-hidden="true" size={22} />
        <span>{selected?.label || 'Нейтральная ссылка'}</span>
        <span className="waka-muted">{expanded ? 'Свернуть ↑' : 'Выбрать иконку ↓'}</span>
      </button>
      {expanded && (
        <div id={`${id}-catalog`} className="waka-icon-field__catalog" onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } }}>
          <label htmlFor={`${id}-search`} className="waka-sr-only">Поиск иконки по названию</label>
          <input id={`${id}-search`} className="waka-icon-field__search" type="search" placeholder="Найти иконку: камера, карта, сердце…" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="waka-icon-field__groups" role="group" aria-label="Категории иконок">
            {[{ id: 'all', label: 'Все' }, ...ICON_GROUPS].map((item) => <button key={item.id} type="button" aria-pressed={group === item.id} onClick={() => setGroup(item.id)}>{item.label}</button>)}
          </div>
          <p className="waka-muted waka-icon-field__count" aria-live="polite">{matches.length ? `Найдено иконок: ${matches.length}` : 'Ничего не найдено. Попробуйте другое название или категорию.'}</p>
          <div className="waka-icon-field__grid" role="group" aria-label="Библиотека иконок">
            {matches.map((icon) => {
              const Icon = CONTENT_ICONS[icon.key as keyof typeof CONTENT_ICONS] || CONTENT_ICONS.link;
              return <button key={icon.key} type="button" disabled={readOnly || disabled} title={icon.label} aria-pressed={value === icon.key} onClick={() => { setValue(icon.key); close(); }}><Icon aria-hidden="true" size={23} /><span>{icon.label}</span></button>;
            })}
          </div>
        </div>
      )}
      {showError && <p className="waka-field-error" role="alert">{errorMessage}</p>}
    </div>
  );
}
