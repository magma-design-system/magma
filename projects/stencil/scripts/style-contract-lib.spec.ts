import { describe, expect, it } from 'vitest';
import { isPublic, markStyles } from './style-contract-lib';

describe('markStyles', () => {
  it('moves the mark into visibility and static, and takes it out of the description', () => {
    const { styles, errors } = markStyles([
      { name: '--mds-a-background', docs: 'Public. Sets the background' },
      { name: '--mds-a-skin', docs: 'Public, static. Sets the skin of the drawing' },
      { name: '--mds-a-icon-color', docs: 'Sets the colour of the icon' },
    ]);
    expect(errors).toEqual([]);
    expect(styles).toEqual([
      { name: '--mds-a-background', docs: 'Sets the background', visibility: 'public' },
      {
        name: '--mds-a-skin',
        docs: 'Sets the skin of the drawing',
        visibility: 'public',
        static: true,
      },
      { name: '--mds-a-icon-color', docs: 'Sets the colour of the icon', visibility: 'internal' },
    ]);
  });

  it('keeps the other fields of the entry', () => {
    const { styles } = markStyles([
      { name: '--mds-a-gap', annotation: 'prop', docs: 'Public. Sets the gap', mode: undefined },
    ]);
    expect(styles[0]).toEqual({
      name: '--mds-a-gap',
      annotation: 'prop',
      docs: 'Sets the gap',
      mode: undefined,
      visibility: 'public',
    });
  });

  it('changes nothing on a second run', () => {
    const once = markStyles([
      { name: '--mds-a-gap', docs: 'Public. Public. Sets the gap' },
      { name: '--mds-a-z', docs: 'Sets the z-index' },
    ]).styles;
    expect(markStyles(once).styles).toEqual(once);
  });

  it('reports a description that tries the mark and misses it', () => {
    const { styles, errors } = markStyles([
      { name: '--mds-a-one', docs: 'public. Sets one' },
      { name: '--mds-a-two', docs: '[Public] Sets two' },
      { name: '--mds-a-three', docs: 'Public: sets three' },
      { name: '--mds-a-four', docs: 'Public.' },
      { name: '--mds-a-five', docs: 'Publication date colour' },
    ]);
    expect(errors).toEqual([
      '--mds-a-one: the description starts like the mark but is not "Public." or "Public, static."',
      '--mds-a-two: the description starts like the mark but is not "Public." or "Public, static."',
      '--mds-a-three: the description starts like the mark but is not "Public." or "Public, static."',
      '--mds-a-four: the mark is the whole description',
    ]);
    expect(styles.map((s) => s.visibility)).toEqual([
      'internal',
      'internal',
      'internal',
      'public',
      'internal',
    ]);
  });
});

describe('isPublic', () => {
  it('reads an entry without visibility as public, as every one was before the contract', () => {
    expect(isPublic({ name: '--mds-a' })).toBe(true);
    expect(isPublic({ name: '--mds-a', visibility: 'public' })).toBe(true);
    expect(isPublic({ name: '--mds-a', visibility: 'internal' })).toBe(false);
  });
});
