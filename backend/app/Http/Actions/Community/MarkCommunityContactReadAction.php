<?php

namespace HiEvents\Http\Actions\Community;

use HiEvents\DomainObjects\Enums\Permission;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Attributes\RequiresPermission;
use HiEvents\Services\Application\Handlers\Community\CommunityContactHandler;
use Illuminate\Http\JsonResponse;

#[RequiresPermission(Permission::MANAGE_CONTENT)]
class MarkCommunityContactReadAction extends BaseAction
{
    public function __construct(private readonly CommunityContactHandler $handler) {}

    public function __invoke(int $organizerId, int $submissionId): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);
        $this->handler->markRead($organizerId, $submissionId);
        return $this->jsonResponse(['data' => ['read' => true]]);
    }
}
