<?php

namespace HiEvents\Http\Actions\Community;

use HiEvents\DomainObjects\Enums\Permission;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Attributes\RequiresPermission;
use HiEvents\Services\Application\Handlers\Community\GetCommunityContentHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use HiEvents\DomainObjects\Enums\CommunityContentType;
use Illuminate\Validation\Rule;
use HiEvents\Resources\Community\CommunityContentResource;

#[RequiresPermission(Permission::MANAGE_CONTENT)]
class GetCommunityContentsAction extends BaseAction
{
    public function __construct(private readonly GetCommunityContentHandler $handler) {}

    public function __invoke(int $organizerId, Request $request): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);
        $data = $request->validate(['type' => ['nullable', Rule::enum(CommunityContentType::class)], 'page' => ['sometimes', 'integer', 'min:1']]);
        return $this->resourceResponse(CommunityContentResource::class, $this->handler->list($organizerId, $data['type'] ?? null, false, (int) ($data['page'] ?? 1)));
    }
}
