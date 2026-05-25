declare module 'svg-dimensions' {
  import { PathLike } from 'fs';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const get: (path: PathLike, callback: Function) => void;
  export { get };
}
