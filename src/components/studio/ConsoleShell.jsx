import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Link2,
  Menu,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Type,
  User,
  Users,
  X,
} from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext.jsx';
import PreviewViewport from './PreviewViewport.jsx';
import ActionBar from './ActionBar.jsx';
import LocalModeBadge from './LocalModeBadge.jsx';
import Dialog from './Dialog.jsx';

const NavGuardContext = createContext(null);

/** Navigate, but confirm first when unsaved edits would be lost. */
export function useNavGuard() {
  return useContext(NavGuardContext);
}

export const NAV_GROUPS = [
  {
    id: 'page',
    label: 'Страница',
    items: [
      { to: '/admin', end: true, label: 'Обзор', Icon: LayoutDashboard },
      { to: '/admin/profile', label: 'Профиль', Icon: User },
      { to: '/admin/media', label: 'Медиа', Icon: ImageIcon },
    ],
  },
  {
    id: 'look',
    label: 'Оформление',
    items: [
      { to: '/admin/fonts', label: 'Шрифты', Icon: Type },
      { to: '/admin/colors', label: 'Цвета', Icon: Palette },
    ],
  },
  {
    id: 'links',
    label: 'Ссылки',
    items: [
      { to: '/admin/links', label: 'Кнопки-ссылки', Icon: Link2 },
      { to: '/admin/social', label: 'Соцсети', Icon: Users },
    ],
  },
  {
    id: 'system',
    label: 'Система',
    items: [{ to: '/admin/access', label: 'Доступ', Icon: KeyRound }],
  },
];

const RAIL_STATE_KEY = 'katy-delma-console-rail';

function readRailCollapsed() {
  try {
    return window.localStorage.getItem(RAIL_STATE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function NavItems({ collapsed, onNavigate, currentPath }) {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div className="nav-group" key={group.id}>
          {collapsed ? (
            <span className="nav-group__label-sr" aria-hidden="true">
              {group.label}
            </span>
          ) : (
            <p className="nav-group__label">{group.label}</p>
          )}

          {group.items.map(({ to, end, label, Icon }) => {
            const current = end ? currentPath === to : currentPath.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                end={end}
                aria-current={current ? 'page' : undefined}
                aria-label={label}
                title={label}
                className={`nav-item${current ? ' nav-item--current' : ''}${
                  collapsed ? ' nav-item--collapsed' : ''
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(to);
                }}
              >
                <Icon className="nav-item__icon" aria-hidden="true" />
                {collapsed ? null : <span className="nav-item__label">{label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

/**
 * The signed-in console shell: a burger-toggled navigation rail, one subject per
 * screen, the always-reachable preview and the single save action.
 */
export default function ConsoleShell({ children }) {
  const { dirty, draft, signOutFrom, address } = useConsole();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(readRailCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(RAIL_STATE_KEY, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* storage unavailable: the rail simply stays at its default width */
    }
  }, [collapsed]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const goTo = useCallback(
    (to) => {
      if (dirty) {
        setPending(to);
        return;
      }
      navigate(to);
    },
    [dirty, navigate]
  );

  const guard = useCallback(
    (to) => {
      if (to === location.pathname) return;
      goTo(to);
    },
    [goTo, location.pathname]
  );

  return (
    <div className={`console-layout${collapsed ? ' console-layout--collapsed' : ''}`}>
      <NavGuardContext.Provider value={guard}>
        <a className="console-skip" href="#console-screen">
          К содержанию экрана
        </a>

        <aside className="console-rail" aria-label="Разделы панели">
          <div className="console-rail__head">
            {collapsed ? null : (
              <span className="console-rail__wordmark">Студия ссылок</span>
            )}
            <button
              type="button"
              className="admin-icon-button"
              aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <PanelLeftOpen className="admin-icon-button__glyph" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="admin-icon-button__glyph" aria-hidden="true" />
              )}
            </button>
          </div>

          <nav className="console-rail__nav">
            <NavItems collapsed={collapsed} onNavigate={guard} currentPath={location.pathname} />
          </nav>

          <div className="console-rail__foot">
            <LocalModeBadge />
            {collapsed ? null : <p className="console-rail__user" title={address}>{address}</p>}
          </div>
        </aside>

        {drawerOpen ? (
          <div className="console-drawer" role="dialog" aria-modal="true" aria-label="Разделы панели">
            <div className="console-drawer__scrim" onClick={() => setDrawerOpen(false)} />
            <div className="console-drawer__panel">
              <div className="console-rail__head">
                <span className="console-rail__wordmark">Студия ссылок</span>
                <button
                  type="button"
                  className="admin-icon-button"
                  aria-label="Закрыть меню"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="admin-icon-button__glyph" aria-hidden="true" />
                </button>
              </div>
              <nav className="console-rail__nav">
                <NavItems collapsed={false} onNavigate={guard} currentPath={location.pathname} />
              </nav>
              <div className="console-rail__foot">
                <LocalModeBadge />
                <p className="console-rail__user" title={address}>{address}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="console-main">
          <header className="console-topbar">
            <button
              type="button"
              className="admin-icon-button console-burger"
              aria-label="Открыть меню"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="admin-icon-button__glyph" aria-hidden="true" />
            </button>

            <div className="console-topbar__spacer" />

            {dirty ? (
              <p className="admin-unsaved" role="status" data-component="unsaved-indicator">
                Есть несохранённые изменения
              </p>
            ) : null}

            <button type="button" className="admin-button admin-button--ghost" onClick={signOutFrom}>
              Выйти
            </button>
          </header>

          <div className="console-workspace">
            <main className="console-screen" id="console-screen">
              {children}
            </main>
            <PreviewViewport content={draft} dirty={dirty} />
          </div>

          <ConsoleActionBar />
        </div>

        {pending ? (
          <Dialog
            title="Перейти в другой раздел?"
            confirmLabel="Перейти без сохранения"
            cancelLabel="Остаться"
            onConfirm={() => {
              const to = pending;
              setPending(null);
              navigate(to);
            }}
            onCancel={() => setPending(null)}
          >
            <p>Есть несохранённые изменения. При переходе в другой раздел они будут потеряны.</p>
          </Dialog>
        ) : null}
      </NavGuardContext.Provider>
    </div>
  );
}

function ConsoleActionBar() {
  const { dirty, saving, loading, status, failureCount, save, reset } = useConsole();

  return (
    <ActionBar
      dirty={dirty}
      saving={saving}
      loading={loading}
      busyLabel={saving ? 'Сохранение…' : null}
      status={status}
      failureCount={failureCount}
      onSave={save}
      onReset={reset}
    />
  );
}
