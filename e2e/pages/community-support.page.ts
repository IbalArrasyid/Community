import type {Page} from '@playwright/test';

export class CommunitySupportPage {
  constructor(private readonly page: Page) {}

  get root() {
    return this.page.getByRole('complementary', {name: 'Contact', exact: true});
  }

  get contactLauncher() {
    return this.root.getByRole('button', {name: 'Contact', exact: true});
  }

  get liveLauncher() {
    return this.root.getByRole('button', {name: 'Live chat', exact: true});
  }

  get dialog() {
    return this.page.getByRole('dialog', {name: 'Contact', exact: true});
  }
}
