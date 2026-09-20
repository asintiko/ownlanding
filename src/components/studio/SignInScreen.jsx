import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useConsole } from '../../context/ConsoleContext.jsx';
import Dialog from './Dialog.jsx';

const ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

const LOCAL_NOTE =
  'Панель работает локально: адрес и пароль хранятся в файле рядом с проектом. Никуда они не отправляются, писем не будет.';

function validate({ address, password, confirm, isSetup }) {
  const errors = {};
  if (!address.trim()) errors.address = 'Введите адрес электронной почты.';
  else if (!ADDRESS_PATTERN.test(address.trim())) {
    errors.address = 'Формат: owner@example.com.';
  }
  if (!password) errors.password = 'Введите пароль.';
  else if (password.length < MIN_PASSWORD) {
    errors.password = `Не короче ${MIN_PASSWORD} символов.`;
  }
  if (isSetup && confirm !== password) errors.confirm = 'Пароли не совпадают.';
  return errors;
}

/**
 * The threshold of the console: sign-in, first-run credential setup, and the
 * local "forgot password" reset. Deliberately the only dark surface.
 *
 * @param {Object} props
 * @param {'signin'|'setup'} props.mode
 */
export default function SignInScreen({ mode }) {
  const { signInWith, setUpWith, forgotPassword, authError, authBusy, clearAuthError } = useConsole();
  const isSetup = mode === 'setup';

  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDone, setResetDone] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    clearAuthError();
    setResetDone('');

    const errors = validate({ address, password, confirm, isSetup });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const ok = isSetup
      ? await setUpWith({ address: address.trim().toLowerCase(), password, confirm })
      : await signInWith({ address: address.trim().toLowerCase(), password });

    if (!ok) {
      // Values stay exactly as typed; the failure is one neutral sentence.
      setFieldErrors({});
    }
  };

  return (
    <div className="auth-page" data-component="auth-page">
      <div className="auth-card">
        <p className="auth-wordmark">Студия ссылок</p>
        <h1 className="auth-title">{isSetup ? 'Создайте доступ к панели' : 'Вход в панель'}</h1>
        <p className="auth-subtitle">
          {isSetup
            ? 'Пароль нужен, чтобы случайный гость за этим компьютером не изменил страницу.'
            : 'Панель редактирования этой страницы.'}
        </p>

        {authError ? (
          <p className="auth-error" role="alert">
            <AlertTriangle className="auth-error__glyph" aria-hidden="true" />
            {authError.message}
          </p>
        ) : null}

        {resetDone ? <p className="auth-note--ok">{resetDone}</p> : null}

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-address">
              Электронная почта<span className="auth-field__required" role="img" aria-label="Обязательное поле">∗</span>
            </label>
            <input
              id="auth-address"
              className={`auth-field__input${fieldErrors.address ? ' auth-field__input--invalid' : ''}`}
              type="email"
              autoComplete="username"
              value={address}
              disabled={authBusy}
              aria-invalid={fieldErrors.address ? 'true' : undefined}
              aria-describedby={fieldErrors.address ? 'auth-address-error' : undefined}
              onChange={(event) => setAddress(event.target.value)}
            />
            {fieldErrors.address ? (
              <p className="auth-field__error" id="auth-address-error" role="alert">
                {fieldErrors.address}
              </p>
            ) : null}
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-password">
              Пароль<span className="auth-field__required" role="img" aria-label="Обязательное поле">∗</span>
            </label>
            <input
              id="auth-password"
              className={`auth-field__input${fieldErrors.password ? ' auth-field__input--invalid' : ''}`}
              type="password"
              autoComplete={isSetup ? 'new-password' : 'current-password'}
              value={password}
              disabled={authBusy}
              aria-invalid={fieldErrors.password ? 'true' : undefined}
              aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
              onChange={(event) => setPassword(event.target.value)}
            />
            {fieldErrors.password ? (
              <p className="auth-field__error" id="auth-password-error" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {isSetup ? (
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="auth-confirm">
                Пароль ещё раз
                <span className="auth-field__required" role="img" aria-label="Обязательное поле">
                  ∗
                </span>
              </label>
              <input
                id="auth-confirm"
                className={`auth-field__input${fieldErrors.confirm ? ' auth-field__input--invalid' : ''}`}
                type="password"
                autoComplete="new-password"
                value={confirm}
                disabled={authBusy}
                aria-invalid={fieldErrors.confirm ? 'true' : undefined}
                aria-describedby={fieldErrors.confirm ? 'auth-confirm-error' : undefined}
                onChange={(event) => setConfirm(event.target.value)}
              />
              {fieldErrors.confirm ? (
                <p className="auth-field__error" id="auth-confirm-error" role="alert">
                  {fieldErrors.confirm}
                </p>
              ) : null}
            </div>
          ) : null}

          {isSetup ? null : (
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setResetDone('');
                setDialogOpen(true);
              }}
            >
              Забыли пароль?
            </button>
          )}

          <button type="submit" className="auth-submit" disabled={authBusy}>
            {authBusy ? 'Проверяем…' : isSetup ? 'Создать доступ' : 'Войти'}
          </button>
        </form>

        <p className="auth-note">{LOCAL_NOTE}</p>
      </div>

      {dialogOpen ? (
        <Dialog
          title="Сбросить пароль локально?"
          confirmLabel="Сбросить пароль"
          cancelLabel="Отмена"
          onConfirm={async () => {
            setDialogOpen(false);
            const result = await forgotPassword();
            if (result) {
              setPassword('');
              setResetDone('Пароль удалён. Настройте новый — настройки страницы на месте.');
            }
          }}
          onCancel={() => setDialogOpen(false)}
        >
          <p>
            Восстановления по почте здесь нет: панель локальная, и пароль хранится в файле рядом с
            проектом, а не на сервере.
          </p>
          <p>
            Сброс удалит только пароль. Имя, описание, ссылки, картинки, шрифты и цвета останутся
            как есть, и после сброса вы зададите новый доступ на этом же экране.
          </p>
        </Dialog>
      ) : null}
    </div>
  );
}
