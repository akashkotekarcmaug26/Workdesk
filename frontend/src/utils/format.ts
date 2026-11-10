export const fmtDate = (d?: string | null): string => {
  if (!d) return '—';
  const date = String(d).length === 10 ? new Date(`${d}T00:00:00`) : new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtDateTime = (d?: string | null): string =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

export const toInputDate = (d?: string | null): string => (d ? String(d).slice(0, 10) : '');
export const today = (): string => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
export const currentPeriod = (): string => {
  const n = new Date();
  return `${n.getFullYear()}-Q${Math.ceil((n.getMonth() + 1) / 3)}`;
};
