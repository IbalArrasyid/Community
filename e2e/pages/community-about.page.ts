import type {Page} from '@playwright/test';

export class CommunityAboutPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/about');
  }

  get main() {
    return this.page.getByRole('main');
  }

  get banner() {
    return this.main.getByRole('region', {name: 'Community', exact: true});
  }

  get contactLink() {
    return this.main.getByRole('region', {name: 'Contact', exact: true}).getByRole('link', {name: 'Contact', exact: true});
  }

  async openContact(): Promise<void> {
    await this.contactLink.click();
  }
}
