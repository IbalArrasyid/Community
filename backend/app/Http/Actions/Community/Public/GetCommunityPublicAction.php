<?php

namespace HiEvents\Http\Actions\Community\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Organizer\OrganizerResourcePublic;
use HiEvents\Services\Application\Handlers\Community\GetCommunityOrganizerHandler;
use Illuminate\Http\JsonResponse;

class GetCommunityPublicAction extends BaseAction
{
    public function __invoke(GetCommunityOrganizerHandler $handler): JsonResponse
    {
        return $this->resourceResponse(OrganizerResourcePublic::class, $handler->handle());
    }
}
