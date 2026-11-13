<?php

namespace Tests\Feature\Http\Community;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\ActsAsAccountUsers;
use Tests\TestCase;

class CommunityContentTest extends TestCase
{
    use ActsAsAccountUsers;
    use DatabaseTransactions;

    private User $owner;

    private int $accountId;

    private int $organizerId;

    protected function setUp(): void
    {
        parent::setUp();
        [$this->owner, $this->accountId] = $this->createAccountOwner();
        $this->organizerId = $this->createOrganizer($this->accountId);
        DB::table('organizers')->where('id', $this->organizerId)->update(['status' => 'LIVE']);
        config(['community.organizer_id' => $this->organizerId]);
    }

    public function test_owner_can_publish_sanitized_content_and_public_payload_omits_internal_fields(): void
    {
        $content = $this->postJson($this->path(), $this->payload([
            'status' => 'PUBLISHED',
            'body' => '<p>Hello community</p><script>alert(1)</script><img src=x onerror=alert(1)>',
        ]), $this->headersFor($this->owner, $this->accountId))->assertCreated();

        $this->getJson('/public/community/content/PAGE/about')->assertOk()
            ->assertJsonPath('data.title', 'About our community')
            ->assertJsonMissingPath('data.organizer_id')
            ->assertJsonMissingPath('data.status');
        $this->assertStringNotContainsString('<script', $content->json('data.body'));
        $this->assertStringNotContainsString('onerror', $content->json('data.body'));
    }

    public function test_drafts_and_future_publications_are_private_even_for_authenticated_staff(): void
    {
        foreach ([
            ['slug' => 'draft', 'status' => 'DRAFT'],
            ['slug' => 'future', 'status' => 'PUBLISHED', 'published_at' => now()->addDay()->format('Y-m-d\TH:i:sP')],
        ] as $attributes) {
            $this->postJson($this->path(), $this->payload($attributes), $this->headersFor($this->owner, $this->accountId))->assertCreated();
            $this->getJson('/public/community/content/PAGE/'.$attributes['slug'], $this->headersFor($this->owner, $this->accountId))->assertNotFound();
        }
        $this->getJson('/public/community/content?type=PAGE')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_unpublishing_removes_content_from_public_access(): void
    {
        $id = $this->postJson($this->path(), $this->payload(['status' => 'PUBLISHED']), $this->headersFor($this->owner, $this->accountId))
            ->assertCreated()->json('data.id');
        $this->putJson($this->path().'/'.$id, $this->payload(), $this->headersFor($this->owner, $this->accountId))->assertOk();
        $this->getJson('/public/community/content/PAGE/about')->assertNotFound();
    }

    public function test_duplicate_slugs_are_validation_errors(): void
    {
        $this->postJson($this->path(), $this->payload(), $this->headersFor($this->owner, $this->accountId))->assertCreated();
        $this->postJson($this->path(), $this->payload(), $this->headersFor($this->owner, $this->accountId))
            ->assertUnprocessable()->assertJsonValidationErrors('slug');
    }

    public function test_content_editor_has_no_payment_permission_and_cannot_access_other_organizers(): void
    {
        $editor = $this->addRestrictedAccountUser($this->accountId, organizerIds: [$this->organizerId], permissions: [
            'MANAGE_CONTENT' => true,
            'VIEW_FINANCIALS' => false,
            'ISSUE_REFUNDS' => false,
        ]);
        $this->postJson($this->path(), $this->payload(), $this->headersFor($editor, $this->accountId))->assertCreated();
        $other = $this->createOrganizer($this->accountId, 'Other');
        $this->getJson("/organizers/$other/community/content", $this->headersFor($editor, $this->accountId))->assertForbidden();
        $this->getJson("/organizers/{$this->organizerId}/stripe/connect_accounts", $this->headersFor($editor, $this->accountId))->assertForbidden();
    }

    public function test_normal_organizer_cannot_read_or_write_cms_without_capability(): void
    {
        $user = $this->addAccountUser($this->accountId, Role::ORGANIZER);
        $this->getJson($this->path(), $this->headersFor($user, $this->accountId))->assertForbidden();
        $this->postJson($this->path(), $this->payload(), $this->headersFor($user, $this->accountId))->assertForbidden();
    }

    public function test_child_content_id_is_scoped_to_authorized_organizer_before_write(): void
    {
        $id = $this->postJson($this->path(), $this->payload(), $this->headersFor($this->owner, $this->accountId))
            ->assertCreated()->json('data.id');
        $other = $this->createOrganizer($this->accountId);
        $this->putJson("/organizers/$other/community/content/$id", $this->payload(['title' => 'Changed']), $this->headersFor($this->owner, $this->accountId))->assertNotFound();
        $this->assertDatabaseHas('community_contents', ['id' => $id, 'title' => 'About our community']);
    }

    public function test_image_from_another_organizer_cannot_be_attached(): void
    {
        $other = $this->createOrganizer($this->accountId);
        $imageId = DB::table('images')->insertGetId([
            'account_id' => $this->accountId,
            'entity_id' => $other,
            'entity_type' => \HiEvents\DomainObjects\OrganizerDomainObject::class,
            'type' => 'ORGANIZER_GALLERY',
            'filename' => 'cover.png',
            'disk' => 'public',
            'path' => 'cover.png',
            'size' => 1,
            'mime_type' => 'image/png',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->postJson($this->path(), $this->payload(['cover_image_id' => $imageId]), $this->headersFor($this->owner, $this->accountId))
            ->assertUnprocessable()->assertJsonValidationErrors('cover_image_id');
        $this->assertDatabaseMissing('community_contents', ['organizer_id' => $this->organizerId]);
    }

    public function test_private_organizer_never_exposes_content_through_community_routes(): void
    {
        DB::table('organizers')->where('id', $this->organizerId)->update(['status' => 'DRAFT']);
        $this->getJson('/public/community')->assertNotFound();
        $this->getJson('/public/community/content?type=ARTICLE')->assertNotFound();
    }

    public function test_password_protected_organizer_is_not_exposed_by_the_community_site(): void
    {
        $organizer = (new \HiEvents\DomainObjects\OrganizerDomainObject)
            ->setId($this->organizerId)
            ->setStatus('LIVE')
            ->setOrganizerSettings((new \HiEvents\DomainObjects\OrganizerSettingDomainObject)
                ->setHomepageVisibility('PASSWORD_PROTECTED'));
        $this->mock(\HiEvents\Services\Application\Handlers\Organizer\GetPublicOrganizerHandler::class)
            ->shouldReceive('handle')->with($this->organizerId)->andReturn($organizer);

        $this->getJson('/public/community')->assertNotFound();
        $this->getJson('/public/community/content?type=PAGE')->assertNotFound();
    }

    private function path(): string
    {
        return "/organizers/{$this->organizerId}/community/content";
    }

    private function payload(array $overrides = []): array
    {
        return array_replace([
            'type' => 'PAGE',
            'slug' => 'about',
            'title' => 'About our community',
            'summary' => 'Meet the community',
            'body' => '<p>Our mission</p>',
            'cover_image_id' => null,
            'status' => 'DRAFT',
            'published_at' => null,
            'seo_title' => null,
            'seo_description' => null,
        ], $overrides);
    }
}
