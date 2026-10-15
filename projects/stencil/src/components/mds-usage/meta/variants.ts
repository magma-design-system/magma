import miBaselineCancel from '@icon/mi/baseline/cancel.svg';
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg';
import miBaselineInfo from '@icon/mi/baseline/info.svg';
import miBaselineWarning from '@icon/mi/baseline/warning.svg';
import { UsageType } from './types';

/**
 * The header icon of each variant, picked for its meaning: `cancel` (an X in a circle)
 * pairs with the tick of `do`, and stays apart from the exclamation mark of `warn`.
 */
const usageVariantIcon: Record<UsageType, string> = {
  do: miBaselineCheckCircle,
  dont: miBaselineCancel,
  info: miBaselineInfo,
  warn: miBaselineWarning,
};

export { usageVariantIcon };
