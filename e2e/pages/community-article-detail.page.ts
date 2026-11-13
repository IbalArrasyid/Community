import type {Page} from '@playwright/test';

export class CommunityArticleDetailPage {
  constructor(private readonly page: Page) {}

  async goto(slug: string): Promise<void> {
    await this.page.goto('/articles/' + encodeURIComponent(slug));
  }

  get main() {
    return this.page.getByRole('main');
  }

  body(title: string) {
    return this.main.getByRole('article', {name: title, exact: true});
  }

  get contents() {
    return this.main.getByRole('navigation', {name: 'Table of contents', exact: true});
  }

  get share() {
    return this.main.getByRole('group', {name: 'Share', exact: true});
  }

  async copyLink(): Promise<void> {
    await this.share.getByRole('button', {name: 'Copy link', exact: true}).click();
  }
}
