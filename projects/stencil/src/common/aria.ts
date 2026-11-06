const hash = (s: string): string => {
  let i: number, h: number;
  for (i = 0, h = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString();
};

const randomInt = (max: number): number => Math.floor(Math.random() * max);

const unslugName = (name: string): string => {
  return name.split('/')?.slice(-1).pop()?.replace(/-/g, ' ') ?? name;
};

const setAttributeIfEmpty = (element: HTMLElement, attribute: string, value: string): string => {
  if (element.hasAttribute(attribute)) {
    return element.getAttribute(attribute) ?? '';
  }
  element.setAttribute(attribute, value);
  return value;
};

const removeAttributesIf = (
  element: HTMLElement,
  attribute: string,
  valueCheck: string = 'true',
  cleanAttributes: string | string[],
): boolean => {
  if (ifAttribute(element, attribute, valueCheck)) {
    const attributesList = Array.isArray(cleanAttributes) ? cleanAttributes : [cleanAttributes];
    attributesList.forEach((attributeToRemove) => {
      element.removeAttribute(attributeToRemove);
    });
    return true;
  }
  return false;
};

const ifAttribute = (
  element: HTMLElement,
  attribute: string,
  valueCheck: string = 'true',
): boolean => {
  if (element.hasAttribute(attribute) && element.getAttribute(attribute) === valueCheck) {
    return true;
  }
  return false;
};

/**
 * Adds an id to an IDREF list attribute (`aria-describedby`, `aria-labelledby`, ...), keeping the
 * ids already there: a description of someone else's stays next to ours.
 */
const addIdRef = (element: Element, attribute: string, id: string): void => {
  const ids = (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
  if (ids.includes(id)) return;
  element.setAttribute(attribute, [...ids, id].join(' '));
};

/** Takes an id back out of an IDREF list attribute, dropping the attribute once it is empty. */
const removeIdRef = (element: Element, attribute: string, id: string): void => {
  const ids = (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) return;
  const rest = ids.filter((ref) => ref !== id);
  if (rest.length === 0) {
    element.removeAttribute(attribute);
    return;
  }
  element.setAttribute(attribute, rest.join(' '));
};

const hashValue = (value: string): string => `${value}-${hash(value)}`;

const hashRandomValue = (value?: string): string => {
  const randomValue = randomInt(1000000);
  if (value) {
    return `${value}-${hash(randomValue.toString())}`;
  }

  return hash(randomValue.toString());
};

/**
 * What the `current` of a button says (#1264): 'page' is the view the button leads to, the one you
 * are in; 'section' is a view inside it, a record of its list. The attribute alone (an empty
 * string), `true` and any other value are the view itself; `false`, the string "false" (a
 * reflected attribute keeps it) and no value mark nothing.
 */
const currentOf = (value: unknown): 'page' | 'section' | undefined => {
  if (value === undefined || value === null || value === false || value === 'false')
    return undefined;
  return value === 'section' ? 'section' : 'page';
};

export {
  addIdRef,
  currentOf,
  hashRandomValue,
  hashValue,
  removeAttributesIf,
  setAttributeIfEmpty,
  ifAttribute,
  removeIdRef,
  unslugName,
};
