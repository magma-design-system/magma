import { MdsInput } from '@maggioli-design-system/magma-react';

const tint = 'rgb(var(--magma-accent) / 0.5)';
export const config = { primary: `rgb(var(--magma-accent) / ${alpha})` };

export const Card = ({ dark, overlay, ...rest }: { dark: boolean; overlay: string }) => (
  <div
    className="p-400 bg-[var(--magma-surface-raised)]"
    style={{
      color: 'var(--magma-accent)',
      backgroundColor: 'color-mix(in srgb, var(--magma-surface-raised) 50%, transparent)',
      '--magma-backdrop-color': 'rgb(0 0 0)',
      borderColor: dark ? 'var(--magma-accent)' : 'var(--magma-on-backdrop)',
      '--magma-overlay-color': overlay,
    }}
  >
    <MdsInput style={{ ['--mds-input-variant-color' as string]: 'rgb(0 85 204)' }} />
    {/* no markup rule in this jump: a spread is not reported */}
    <MdsInput {...rest} />
    <span style={{ color: tint }} />
    <svg>
      <path fill="rgb(var(--magma-accent))" />
    </svg>
  </div>
);
