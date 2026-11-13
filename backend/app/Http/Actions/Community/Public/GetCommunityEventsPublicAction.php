<?php

namespace HiEvents\Http\Actions\Community\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Event\EventResourcePublic;
use HiEvents\Services\Application\Handlers\Community\GetCommunityOrganizerHandler;
use HiEvents\Services\Application\Handlers\Event\DTO\GetPublicOrganizerEventsDTO;
use HiEvents\Services\Application\Handlers\Event\GetPublicEventsHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetCommunityEventsPublicAction extends BaseAction
{
    public function __invoke(Request $request, GetCommunityOrganizerHandler $site, GetPublicEventsHandler $handler): JsonResponse
    {
        $request->validate(['query' => ['nullable', 'string', 'max:200'], 'page' => ['sometimes', 'integer', 'min:1']]);

        return $this->resourceResponse(EventResourcePublic::class, $handler->handle(new GetPublicOrganizerEventsDTO(
            organizerId: $site->handle()->getId(),
            queryParams: $this->getPaginationQueryParams($request),
            authenticatedAccountId: null,
        )));
    }
}
