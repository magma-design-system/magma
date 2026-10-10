import clsx from 'clsx';

export const Layout = ({ open }: { open: boolean }) => (
  <main className={clsx('grid mobile:p-0', open && 'tablet-max:hidden -mt-1/2')} />
);
