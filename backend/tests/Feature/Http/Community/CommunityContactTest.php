<?php

namespace Tests\Feature\Http\Community;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\ActsAsAccountUsers;
use Tests\TestCase;

class CommunityContactTest extends TestCase
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

    public function test_contact_persists_and_only_authorized_staff_can_read_and_mark_it(): void
    {
        $this->postJson('/public/community/contact', $this->payload())->assertCreated()
            ->assertJsonPath('data.received', true)->assertJsonMissingPath('data.email');
        $this->assertDatabaseHas('community_contact_submissions', ['organizer_id' => $this->organizerId, 'subject' => 'Volunteer']);
        $path = "/organizers/{$this->organizerId}/community/contacts";
        $id = $this->getJson($path, $this->headersFor($this->owner, $this->accountId))->assertOk()->json('data.0.id');
        $this->putJson("$path/$id/read", [], $this->headersFor($this->owner, $this->accountId))->assertOk();
        $firstRead = DB::table('community_contact_submissions')->where('id', $id)->value('read_at');
        $this->putJson("$path/$id/read", [], $this->headersFor($this->owner, $this->accountId))->assertOk();
        $this->assertSame($firstRead, DB::table('community_contact_submissions')->where('id', $id)->value('read_at'));
        $user = $this->addAccountUser($this->accountId, Role::ORGANIZER);
        $this->getJson($path, $this->headersFor($user, $this->accountId))->assertForbidden();
        $this->getJson($path)->assertUnauthorized();
    }

    public function test_honeypot_invalid_email_and_short_messages_are_rejected(): void
    {
        $this->postJson('/public/community/contact', [...$this->payload(), 'website' => 'https://spam.example'])
            ->assertUnprocessable()->assertJsonValidationErrors('website');
        $this->postJson('/public/community/contact', [...$this->payload(), 'email' => 'invalid', 'message' => 'tiny'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email', 'message']);
        $this->assertDatabaseMissing('community_contact_submissions', ['organizer_id' => $this->organizerId]);
    }

    public function test_contact_read_is_scoped_to_the_authorized_organizer(): void
    {
        $this->postJson('/public/community/contact', $this->payload())->assertCreated();
        $id = DB::table('community_contact_submissions')->where('organizer_id', $this->organizerId)->value('id');
        $other = $this->createOrganizer($this->accountId);
        $this->putJson("/organizers/$other/community/contacts/$id/read", [], $this->headersFor($this->owner, $this->accountId))->assertNotFound();
        $this->assertDatabaseHas('community_contact_submissions', ['id' => $id, 'read_at' => null]);
    }

    public function test_contact_route_has_named_rate_limit(): void
    {
        $route = app('router')->getRoutes()->match(\Illuminate\Http\Request::create('/public/community/contact', 'POST'));
        $this->assertContains('throttle:5,60,community-contact', $route->gatherMiddleware());
    }

    private function payload(): array
    {
        return ['name' => 'Community Visitor', 'email' => 'visitor@example.test', 'subject' => 'Volunteer', 'message' => 'I would like to volunteer at the next event.', 'website' => ''];
    }
}
