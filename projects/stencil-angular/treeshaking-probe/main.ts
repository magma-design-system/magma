/**
 * Smallest possible Angular app using exactly one Magma component.
 *
 * Built by `scripts/check-treeshaking.ts` to measure what an Angular consumer
 * really ships. It has to go through the Angular CLI rather than a plain
 * bundler: the CLI runs a Babel pass that marks the `__decorate` calls emitted
 * for `@ProxyCmp` as pure and elides `ɵɵngDeclareClassMetadata`, without which
 * every proxy in the FESM looks side-effectful and nothing can be dropped.
 *
 * Keep it importing a single component - the check asserts that no unrelated
 * `mds-*` tag survives in the output.
 */
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { MdsButton } from '@maggioli-design-system/magma-angular';

@Component({
  selector: 'app-root',
  imports: [MdsButton],
  template: '<mds-button variant="primary">Save</mds-button>',
})
export class AppComponent {}

void bootstrapApplication(AppComponent);
