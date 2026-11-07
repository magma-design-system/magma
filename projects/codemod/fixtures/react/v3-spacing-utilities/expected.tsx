import clsx from 'clsx';

export const Toolbar = ({ dense }: { dense: boolean }) => (
  <div className={clsx('flex gap-400', dense ? 'p-200' : 'p-600', { 'mt-800': !dense })}>
    <section className="w-md max-w-2xl gap-y-1600" style={{ maxWidth: 'var(--container-text)' }} />
    <aside className="inline-xs" />
  </div>
);
