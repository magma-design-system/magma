declare module "svg-dimensions" {
  import { PathLike } from "fs";
  const get: (path: PathLike, callback: Function) => void;
  export { get };
}
