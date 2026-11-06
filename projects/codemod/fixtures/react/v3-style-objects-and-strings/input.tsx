import { MdsInput } from '@maggioli-design-system/magma-react';

const tint = 'rgb(var(--magma-accent) / 0.5)';
export const config = { primary: `rgb(var(--magma-accent) / ${alpha})` };

export const Card = ({ dark, overlay, ...rest }: { dark: boolean; overlay: string }) => (
  <div
    className="p-400 bg-[rgb(var(--magma-surface-raised))]"
    style={{
      color: 'rgb(var(--magma-accent))',
      backgroundColor: 'rgb(var(--magma-surface-raised) / 0.5)',
      '--magma-backdrop-color': '0 0 0',
      borderColor: dark ? 'rgb(var(--magma-accent))' : 'rgb(var(--magma-on-backdrop) / 1)',
      '--magma-overlay-color': overlay,
    }}
  >
    <MdsInput style={{ ['--mds-input-variant-color-rgb' as string]: '0 85 204' }} />
    {/* no markup rule in this jump: a spread is not reported */}
    <MdsInput {...rest} />
    <span style={{ color: tint }} />
    <svg>
      <path fill="rgb(var(--magma-accent))" />
    </svg>
  </div>
);
