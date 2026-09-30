export const Card = ({ active }: { active: boolean }) => (
  <section className="p-4 shadow-ring-weak rounded-2xs">
    <mds-button class="gap-lg" label="Save" />
    <div className={clsx('shadow-inset-sm', active && 'shadow-ring-weak')}>x</div>
  </section>
);
