<?php

namespace HiEvents\Http\Actions\Community\Public;

use HiEvents\DomainObjects\Enums\CommunityContentType;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Community\CommunityContentPublicResource;
use HiEvents\Services\Application\Handlers\Community\GetCommunityContentHandler;
use HiEvents\Services\Application\Handlers\Community\GetCommunityOrganizerHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GetCommunityContentsPublicAction extends BaseAction
{
    public function __invoke(Request $request, GetCommunityOrganizerHandler $site, GetCommunityContentHandler $handler): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::enum(CommunityContentType::class)],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        return $this->resourceResponse(CommunityContentPublicResource::class, $handler->list(
            $site->handle()->getId(), $data['type'], true, (int) ($data['page'] ?? 1),
        ));
    }
}
