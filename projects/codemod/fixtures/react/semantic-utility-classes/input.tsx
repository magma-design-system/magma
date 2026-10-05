import clsx from 'clsx';

export const Card = ({ selected }: { selected: boolean }) => (
  <div className="rounded-xs bg-tone-neutral-09 p-600 dark:bg-tone-neutral-08">
    <span className="text-tone-neutral-04 dark:text-tone-neutral-02">caption</span>
    <hr
      className={clsx(
        'h-50 border-0 border-t-tone-neutral-09',
        selected && 'dark:bg-tone-neutral-09',
      )}
    />
    <p className="bg-tone-neutral p-2 text-status-error-04">error</p>
    <section className="bg-tone-neutral-10 dark:bg-tone-neutral-09">ambiguous</section>
  </div>
);
