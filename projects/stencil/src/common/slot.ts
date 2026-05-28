const hasSlottedElements = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])';

  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement;
  if (slot) {
    return slot.assignedElements({ flatten: true }).length > 0;
  }
  return false;
};

const hasSlottedNodes = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])';

  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement;
  if (slot) {
    return slot.assignedNodes().length > 0;
  }
  return false;
};

const hasSlotted = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])';

  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement;
  if (slot) {
    return slot.assignedNodes().length > 0 || slot.assignedElements().length > 0;
  }
  return false;
};

const hasSlottedContent = (el: HTMLElement, name?: string): boolean => {
  const query = name ? `slot[name="${name}"]` : 'slot:not([name])';
  const slot: HTMLSlotElement = el.shadowRoot?.querySelector(query) as HTMLSlotElement;
  if (!slot) return false;

  const assignedNodes = slot.assignedNodes({ flatten: true });
  return assignedNodes.some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '',
  );
};

/**
 * Normalises a label-like string: trims whitespace and coerces empty/nullish
 * values to `undefined`. Use inside `@Watch('label')` handlers when a component
 * exposes a `label` prop with a deprecated default slot fallback.
 */
const sanitizeLabel = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * Reads text assigned to the host's default `<slot />` for use as a fallback
 * when a `label` prop has not been set. Intended to be called from an
 * `onSlotchange` handler on a deprecated default slot.
 *
 * Only the nodes actually assigned to the default slot are inspected (named
 * slots like `notification` are ignored). Element nodes are stripped — the
 * concatenated text content of the assigned nodes is returned instead — and a
 * `console.warn` is emitted so developers can migrate to the `label`
 * property. Returns `undefined` for empty/whitespace.
 */
const readSlottedLabel = (host: HTMLElement): string | undefined => {
  const slot = host.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
  if (!slot) return undefined;

  const assigned = slot.assignedNodes({ flatten: true });
  if (assigned.length === 0) return undefined;

  const hasElements = assigned.some((node) => node.nodeType === Node.ELEMENT_NODE);
  if (hasElements) {
    console.warn(
      `<${host.tagName.toLowerCase()}>: markup inside the default slot is not supported and has been stripped. Use the \`label\` property to pass plain text instead.`,
    );
  }

  const text = assigned.map((node) => node.textContent ?? '').join('');
  return sanitizeLabel(text);
};

export {
  hasSlottedElements,
  hasSlottedNodes,
  hasSlottedContent,
  hasSlotted,
  sanitizeLabel,
  readSlottedLabel,
};
