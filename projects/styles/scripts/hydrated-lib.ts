import postcss from 'postcss';

/**
 * The sheet a component writes next to its sources for the box its host takes before it
 * hydrates, on a page that does not render it on the server (#1409): `css/<tag>-pre-hydration.css`
 * under `projects/stencil/src/components/<tag>`. hydrated.ts collects every one into hydrated.css.
 */
export const PRE_HYDRATION_SUFFIX = '-pre-hydration.css';

/** The guard of every rule of hydrated.css that styles a host before it hydrates. */
export const NOT_HYDRATED = ':not(:is([hydrated], .hydrated))';

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Whether a selector matches the host of `tag` before hydration only: the tag, any attribute
 * selectors, then the guard, and nothing after it. Page CSS beats `:host` whatever its layer, so
 * a rule that still matched a hydrated host would override the component for good; a descendant
 * would style the light DOM, which is not the host's box.
 */
export const isPreHydrationSelector = (selector: string, tag: string): boolean =>
  new RegExp(`^${escape(tag)}(\\[[^\\]]+\\])*${escape(NOT_HYDRATED)}$`).test(selector.trim());

/**
 * The rules of a `css/<tag>-pre-hydration.css` as they ship in hydrated.css, without the
 * comments, which carry the reasons for the review and stay in the source. Throws, naming each
 * one, on a selector that is not a pre-hydration selector of `tag` and on an at-rule: the sheet
 * holds the box of the host, nothing else.
 */
export const preHydrationRules = (css: string, tag: string, from?: string): string => {
  const root = postcss.parse(css, { from });
  const errors: string[] = [];
  root.walkComments((comment) => {
    comment.remove();
  });
  root.walkAtRules((atRule) => {
    errors.push(`@${atRule.name} ${atRule.params}`.trim());
  });
  root.walkRules((rule) => {
    for (const selector of rule.selectors) {
      if (!isPreHydrationSelector(selector, tag)) errors.push(selector);
    }
  });
  if (errors.length > 0) {
    throw new Error(
      `${from ?? tag}: every rule styles the host of ${tag} before hydration only ` +
        `(${tag}[attribute]...${NOT_HYDRATED}), with no at-rule:\n` +
        errors.map((error) => `  ${error}`).join('\n'),
    );
  }
  return root.toString().trim();
};
