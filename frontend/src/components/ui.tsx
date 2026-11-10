import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';

/* ---------- toasts ---------- */
type ToastKind = 'ok' | 'error';
type ToastFn = (message: string, kind?: ToastKind) => void;

const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Array<{ id: number; message: string; kind: ToastKind }>>([]);
  const push = useCallback<ToastFn>((message, kind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, message, kind }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- labels and status ---------- */
const LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  open: 'Open',
  resolved: 'Resolved',
  closed: 'Closed',
  active: 'Active',
  inactive: 'Inactive',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  technical: 'Technical',
  hr: 'HR',
  payroll: 'Payroll',
  other: 'Other',
  admin: 'Admin',
  employee: 'Employee',
  approved: 'Approved',
  rejected: 'Rejected',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
};
export const label = (v?: string): string => (v ? LABELS[v] || v : '');

export const Status = ({ value }: { value: string }) => (
  <span className={`status s-${value}`}>
    <i aria-hidden="true" />
    {label(value)}
  </span>
);

/* ---------- layout helpers ---------- */
export const PageHeader = ({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: ReactNode;
}) => (
  <div className="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p className="muted">{sub}</p>}
    </div>
    <div className="actions">{children}</div>
  </div>
);

export const Loading = () => (
  <p className="muted" role="status">
    Loading…
  </p>
);

export const ErrorBox = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="notice err-box" role="alert">
    {message}{' '}
    {onRetry && (
      <button type="button" className="btn-link" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const Empty = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="empty">
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);

export const Strip = ({
  items,
}: {
  items: Array<{ label: string; value: string | number; note?: string }>;
}) => (
  <div className="strip">
    {items.map((i) => (
      <div key={i.label} className="strip-item">
        <span className="strip-value">{i.value}</span>
        <span className="strip-label">{i.label}</span>
        {i.note && <span className="strip-note">{i.note}</span>}
      </div>
    ))}
  </div>
);

// Horizontal bars for a { key: count } map
export function Bars({
  data = {},
  order,
  colors = {},
}: {
  data?: Record<string, number | undefined>;
  order?: string[];
  colors?: Record<string, string>;
}) {
  const keys = order || Object.keys(data);
  const max = Math.max(1, ...keys.map((k) => data[k] || 0));
  return (
    <div className="bars">
      {keys.map((k) => (
        <div className="bar-row" key={k}>
          <span>{label(k)}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${((data[k] || 0) / max) * 100}%`,
                background: colors[k] || 'var(--teal)',
              }}
            />
          </div>
          <strong>{data[k] || 0}</strong>
        </div>
      ))}
    </div>
  );
}

/* ---------- forms ---------- */
export const Field = ({
  id,
  label: text,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className={`field${error ? ' has-error' : ''}`}>
    <label htmlFor={id}>{text}</label>
    {children}
    {hint && !error && <small className="hint">{hint}</small>}
    {error && (
      <small className="err" role="alert">
        {error}
      </small>
    )}
  </div>
);

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal(); // native dialog: focus trap + Esc key
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="btn-link" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}

// Two-step delete: first click asks, second click confirms
export function ConfirmButton({
  onConfirm,
  children = 'Delete',
  confirmText = 'Confirm delete',
}: {
  onConfirm: () => void;
  children?: ReactNode;
  confirmText?: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" className="btn-link danger" onClick={() => setAsking(true)}>
        {children}
      </button>
    );
  return (
    <span className="confirm">
      <button
        type="button"
        className="btn-link danger"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmText}
      </button>
      <button type="button" className="btn-link" onClick={() => setAsking(false)}>
        Cancel
      </button>
    </span>
  );
}
