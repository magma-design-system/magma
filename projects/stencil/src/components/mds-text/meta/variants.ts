const typographyDefaultsVariant = {
  action: {
    tag: 'span',
    selector: {
      default: 'text-title-action',
      title: 'text-title-action',
    },
  },
  caption: {
    tag: 'span',
    selector: {
      default: 'text-info-caption',
      info: 'text-info-caption',
      read: 'text-read-caption',
    },
  },
  detail: {
    tag: 'p',
    selector: {
      default: 'text-info-detail',
      info: 'text-info-detail',
      read: 'text-read-detail',
    },
  },
  h1: {
    tag: 'h1',
    selector: {
      default: 'text-title-h1',
      title: 'text-title-h1',
    },
  },
  h2: {
    tag: 'h2',
    selector: {
      default: 'text-title-h2',
      title: 'text-title-h2',
    },
  },
  h3: {
    tag: 'h3',
    selector: {
      default: 'text-title-h3',
      title: 'text-title-h3',
    },
  },
  h4: {
    tag: 'h4',
    selector: {
      default: 'text-title-h4',
      title: 'text-title-h4',
    },
  },
  h5: {
    tag: 'h5',
    selector: {
      default: 'text-title-h5',
      title: 'text-title-h5',
    },
  },
  h6: {
    tag: 'h6',
    selector: {
      default: 'text-title-h6',
      title: 'text-title-h6',
    },
  },
  // A title by role (#1189) takes the tag of the level its role is styled as, the value of
  // role.title in projects/design-tokens/tokens/typography/role.json (the e2e test reads it);
  // the outline of the page sets the tag, so a page title is written with tag="h1".
  page: {
    tag: 'h3',
    selector: {
      default: 'text-title-page',
      title: 'text-title-page',
    },
  },
  section: {
    tag: 'h5',
    selector: {
      default: 'text-title-section',
      title: 'text-title-section',
    },
  },
  dialog: {
    tag: 'h5',
    selector: {
      default: 'text-title-dialog',
      title: 'text-title-dialog',
    },
  },
  part: {
    tag: 'h6',
    selector: {
      default: 'text-title-part',
      title: 'text-title-part',
    },
  },
  group: {
    tag: 'h6',
    selector: {
      default: 'text-title-group',
      title: 'text-title-group',
    },
  },
  hack: {
    tag: 'code',
    selector: {
      default: 'text-code-hack',
      mono: 'text-code-hack',
    },
  },
  label: {
    tag: 'label',
    selector: {
      default: 'text-info-label',
      info: 'text-info-label',
    },
  },
  option: {
    tag: 'label',
    selector: {
      default: 'text-info-option',
      info: 'text-info-option',
    },
  },
  paragraph: {
    tag: 'p',
    selector: {
      default: 'text-info-paragraph',
      secondary: 'text-secondary-paragraph',
      info: 'text-info-paragraph',
      read: 'text-read-paragraph',
    },
  },
  snippet: {
    tag: 'code',
    selector: {
      default: 'text-code-snippet',
      mono: 'text-code-snippet',
    },
  },
  tip: {
    tag: 'div',
    selector: {
      default: 'text-info-tip',
      info: 'text-info-tip',
    },
  },
};

export { typographyDefaultsVariant };
