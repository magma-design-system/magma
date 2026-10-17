import { addIdRef, removeIdRef } from '@common/aria';

describe('IDREF lists', () => {
  it('adds an id next to the ones already there, once', () => {
    const element = document.createElement('button');
    element.setAttribute('aria-describedby', 'tip');

    addIdRef(element, 'aria-describedby', 'badge');
    addIdRef(element, 'aria-describedby', 'badge');

    expect(element.getAttribute('aria-describedby')).toBe('tip badge');
  });

  it('takes an id back out, and the attribute with the last one', () => {
    const element = document.createElement('button');
    element.setAttribute('aria-describedby', 'tip  badge');

    removeIdRef(element, 'aria-describedby', 'badge');
    expect(element.getAttribute('aria-describedby')).toBe('tip');

    removeIdRef(element, 'aria-describedby', 'tip');
    expect(element.hasAttribute('aria-describedby')).toBe(false);
  });

  it('leaves a list without the id alone', () => {
    const element = document.createElement('button');
    element.setAttribute('aria-describedby', 'tip');

    removeIdRef(element, 'aria-describedby', 'badge');

    expect(element.getAttribute('aria-describedby')).toBe('tip');
  });
});
