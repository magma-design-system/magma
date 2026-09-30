/** Shared transformer contract used by every surface. */
import { type Finding } from '../../report/types.js';

export interface TransformContext {
  /** Path of the file being transformed (for findings). */
  file: string;
  /** When set, only these rule ids run. */
  only?: ReadonlySet<string>;
  /** These rule ids are skipped. */
  skip?: ReadonlySet<string>;
}

export interface TransformResult {
  output: string;
  changed: boolean;
  findings: Finding[];
}

/** Whether a rule id passes the `--only` / `--skip` filters. */
export const ruleEnabled = (ctx: TransformContext, id: string): boolean => {
  if (ctx.only && !ctx.only.has(id)) return false;
  if (ctx.skip && ctx.skip.has(id)) return false;
  return true;
};
