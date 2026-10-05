import clsx from 'clsx';

export const Layout = ({ open }: { open: boolean }) => (
  <main className={clsx('grid max-tablet:p-0', open && 'max-desktop:hidden -mt-[50%]')} />
);
