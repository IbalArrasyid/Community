<?php

namespace HiEvents\Http\Actions\Community;

use HiEvents\DomainObjects\Enums\Permission;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Attributes\RequiresPermission;
use HiEvents\Services\Application\Handlers\Community\CommunityContactHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use HiEvents\Resources\Community\CommunityContactResource;

#[RequiresPermission(Permission::MANAGE_CONTENT)]
class GetCommunityContactsAction extends BaseAction
{
    public function __construct(private readonly CommunityContactHandler $handler) {}

    public function __invoke(int $organizerId, Request $request): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);
        $data = $request->validate(['page' => ['sometimes', 'integer', 'min:1']]);
        return $this->resourceResponse(CommunityContactResource::class, $this->handler->list($organizerId, (int) ($data['page'] ?? 1)));
    }
}
