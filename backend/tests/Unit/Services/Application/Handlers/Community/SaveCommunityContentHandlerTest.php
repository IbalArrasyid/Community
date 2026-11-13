<?php

namespace Tests\Unit\Services\Application\Handlers\Community;

use HiEvents\DomainObjects\Enums\Permission;
use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Repository\Eloquent\CommunityContentRepository;
use HiEvents\Repository\Interfaces\ImageRepositoryInterface;
use HiEvents\Services\Application\Handlers\Community\DTO\CommunityContentData;
use HiEvents\Services\Application\Handlers\Community\SaveCommunityContentHandler;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Mockery;
use Tests\TestCase;

class SaveCommunityContentHandlerTest extends TestCase
{
    public function test_sanitizes_body_and_clears_draft_publication_date_before_saving(): void
    {
        $repository = Mockery::mock(CommunityContentRepository::class);
        $images = Mockery::mock(ImageRepositoryInterface::class);
        $purifier = Mockery::mock(HtmlPurifierService::class);
        $purifier->shouldReceive('purify')->once()->with('<p>Content</p><script>bad()</script>')->andReturn('<p>Content</p>');
        $result = $this->content();
        $repository->shouldReceive('save')->once()->with(12, Mockery::on(fn (array $attributes) =>
            $attributes['body'] === '<p>Content</p>' && $attributes['published_at'] === null
        ), null)->andReturn($result);

        $handler = new SaveCommunityContentHandler($repository, $images, $purifier);
        $this->assertSame($result, $handler->handle(12, [
            'body' => '<p>Content</p><script>bad()</script>',
            'status' => 'DRAFT',
            'published_at' => '2030-01-01T00:00:00+00:00',
        ]));
    }

    public function test_publication_schedule_is_normalized_to_utc(): void
    {
        $repository = Mockery::mock(CommunityContentRepository::class);
        $images = Mockery::mock(ImageRepositoryInterface::class);
        $purifier = Mockery::mock(HtmlPurifierService::class);
        $purifier->shouldReceive('purify')->once()->with('<p>Content</p>')->andReturn('<p>Content</p>');
        $result = $this->content();
        $expected = \Carbon\CarbonImmutable::parse('2030-01-01T10:00:00+07:00')->utc();
        $repository->shouldReceive('save')->once()->with(12, Mockery::on(fn (array $attributes) =>
            $attributes['published_at']->equalTo($expected) && $attributes['published_at']->getTimezone()->getName() === 'UTC'
        ), null)->andReturn($result);

        (new SaveCommunityContentHandler($repository, $images, $purifier))->handle(12, [
            'body' => '<p>Content</p>',
            'status' => 'PUBLISHED',
            'published_at' => '2030-01-01T10:00:00+07:00',
        ]);
    }

    public function test_content_capability_can_be_granted_without_financial_permissions(): void
    {
        $permissions = Role::ORGANIZER->permissionsWith([
            'MANAGE_CONTENT' => true,
            'VIEW_FINANCIALS' => false,
            'ISSUE_REFUNDS' => false,
        ]);

        $this->assertContains(Permission::MANAGE_CONTENT, $permissions);
        $this->assertNotContains(Permission::MANAGE_CONTENT, Role::ORGANIZER->defaultPermissions());
        $this->assertNotContains(Permission::MANAGE_PAYMENTS, $permissions);
        $this->assertNotContains(Permission::VIEW_FINANCIALS, $permissions);
        $this->assertNotContains(Permission::MANAGE_CONTENT, Role::VIEWER->permissionsWith(['MANAGE_CONTENT' => true]));
    }

    private function content(): CommunityContentData
    {
        return new CommunityContentData(1, 12, 'PAGE', 'about', 'About', null, '<p>Content</p>', null, 'DRAFT', null, null, null);
    }
}
