<?php

namespace HiEvents\Http\Actions\Community\Public;

use HiEvents\DomainObjects\Enums\CommunityContentType;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Community\CommunityContentPublicResource;
use HiEvents\Services\Application\Handlers\Community\GetCommunityContentHandler;
use HiEvents\Services\Application\Handlers\Community\GetCommunityOrganizerHandler;
use Illuminate\Http\JsonResponse;

class GetCommunityContentPublicAction extends BaseAction
{
    public function __invoke(string $type, string $slug, GetCommunityOrganizerHandler $site, GetCommunityContentHandler $handler): JsonResponse
    {
        abort_unless(CommunityContentType::tryFrom($type), 404);

        return $this->resourceResponse(CommunityContentPublicResource::class, $handler->find(
            $site->handle()->getId(), $slug, true, $type,
        ));
    }
}
