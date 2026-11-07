import clsx from 'clsx';

export const Toolbar = ({ dense }: { dense: boolean }) => (
  <div className={clsx('flex gap-md', dense ? 'p-sm' : 'p-lg', { 'mt-xl': !dense })}>
    <section className="w-md max-w-2xl gap-y-3xl" style={{ maxWidth: 'var(--spacing-text)' }} />
    <aside className="inline-xs" />
  </div>
);
