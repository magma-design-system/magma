export const Card = ({ active }: { active: boolean }) => (
  <section className="p-4 shadow-outline-light rounded-md">
    <mds-button class="gap" label="Save" />
    <div className={clsx('shadow-inner', active && 'shadow-outline-light')}>x</div>
  </section>
);
