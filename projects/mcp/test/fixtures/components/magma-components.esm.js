// A stand-in for the lazy loader of the Magma dist (dist/magma-components), for the tests of
// render_preview: it defines its components as Stencil does, with the `hydrated` attribute on
// each one once it renders and `appload` on window once the first load is done, so a test
// controls each failure the render checks: mds-stuck never hydrates, mds-fail throws, and
// mds-layer is an overlay, its content in a popover of its shadow root, in the top layer with
// `open`, as the window of mds-status-bar.
const shadow = (host, html) => {
  if (!host.shadowRoot) host.attachShadow({ mode: 'open' }).innerHTML = html;
};

customElements.define(
  'mds-fixture',
  class extends HTMLElement {
    connectedCallback() {
      shadow(
        this,
        '<style>:host { display: inline-block; padding: 8px; background: #2563eb; color: #fff; }</style><span class="text"><slot></slot></span>',
      );
      this.setAttribute('hydrated', '');
    }
  },
);

customElements.define(
  'mds-stuck',
  class extends HTMLElement {
    connectedCallback() {
      shadow(this, '<span class="text"><slot></slot></span>');
    }
  },
);

customElements.define(
  'mds-layer',
  class extends HTMLElement {
    connectedCallback() {
      shadow(
        this,
        '<style>:host { display: block; }</style><div popover="manual" class="window"><slot></slot></div>',
      );
      if (this.hasAttribute('open')) this.shadowRoot.querySelector('.window').showPopover();
      this.setAttribute('hydrated', '');
    }
  },
);

customElements.define(
  'mds-fail',
  class extends HTMLElement {
    connectedCallback() {
      throw new Error('mds-fail cannot render');
    }
  },
);

setTimeout(() => dispatchEvent(new CustomEvent('appload')), 0);
