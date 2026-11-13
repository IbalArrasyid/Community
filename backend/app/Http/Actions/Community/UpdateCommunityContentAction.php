<?php

namespace HiEvents\Http\Actions\Community;

use HiEvents\DomainObjects\Enums\Permission;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Attributes\RequiresPermission;
use HiEvents\Services\Application\Handlers\Community\SaveCommunityContentHandler;
use Illuminate\Http\JsonResponse;
use HiEvents\Http\Request\Community\SaveCommunityContentRequest;
use HiEvents\Resources\Community\CommunityContentResource;

#[RequiresPermission(Permission::MANAGE_CONTENT)]
class UpdateCommunityContentAction extends BaseAction
{
    public function __construct(private readonly SaveCommunityContentHandler $handler) {}

    public function __invoke(int $organizerId, int $contentId, SaveCommunityContentRequest $request): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);
        return $this->resourceResponse(CommunityContentResource::class, $this->handler->handle($organizerId, $request->validated(), $contentId));
    }
}
