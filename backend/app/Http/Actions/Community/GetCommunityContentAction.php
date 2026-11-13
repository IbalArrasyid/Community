<?php

namespace HiEvents\Http\Actions\Community;

use HiEvents\DomainObjects\Enums\Permission;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Attributes\RequiresPermission;
use HiEvents\Services\Application\Handlers\Community\GetCommunityContentHandler;
use Illuminate\Http\JsonResponse;
use HiEvents\Resources\Community\CommunityContentResource;

#[RequiresPermission(Permission::MANAGE_CONTENT)]
class GetCommunityContentAction extends BaseAction
{
    public function __construct(private readonly GetCommunityContentHandler $handler) {}

    public function __invoke(int $organizerId, int $contentId): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);
        return $this->resourceResponse(CommunityContentResource::class, $this->handler->find($organizerId, $contentId));
    }
}
