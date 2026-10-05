import clsx from 'clsx';

export const Card = ({ selected }: { selected: boolean }) => (
  <div className="rounded-xs bg-wash-base p-600">
    <span className="text-fg-subtle">caption</span>
    <hr
      className={clsx('h-50 border-0 border-t-border-muted', selected && 'dark:bg-tone-neutral-09')}
    />
    <p className="bg-tone-neutral-seed p-2 text-status-error-04">error</p>
    <section className="bg-tone-neutral-10 dark:bg-tone-neutral-09">ambiguous</section>
  </div>
);
