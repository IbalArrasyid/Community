<?php

namespace HiEvents\Services\Application\Handlers\Community;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\Enums\OrganizerHomepageVisibility;
use HiEvents\DomainObjects\Status\OrganizerStatus;
use HiEvents\Services\Application\Handlers\Organizer\GetPublicOrganizerHandler;

class GetCommunityOrganizerHandler
{
    public function __construct(private readonly GetPublicOrganizerHandler $organizerHandler) {}

    public function handle(): OrganizerDomainObject
    {
        $id = filter_var(config('community.organizer_id'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        abort_unless($id, 404);
        $organizer = $this->organizerHandler->handle($id);
        abort_unless($organizer->getStatus() === OrganizerStatus::LIVE->name, 404);
        abort_unless(($organizer->getOrganizerSettings()?->getHomepageVisibility() ?? OrganizerHomepageVisibility::PUBLIC->value) === OrganizerHomepageVisibility::PUBLIC->value, 404);

        return $organizer;
    }
}
