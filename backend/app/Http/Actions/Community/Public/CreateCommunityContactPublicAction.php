<?php

namespace HiEvents\Http\Actions\Community\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\Community\CreateCommunityContactRequest;
use HiEvents\Services\Application\Handlers\Community\CommunityContactHandler;
use HiEvents\Services\Application\Handlers\Community\GetCommunityOrganizerHandler;
use Illuminate\Http\JsonResponse;

class CreateCommunityContactPublicAction extends BaseAction
{
    public function __invoke(CreateCommunityContactRequest $request, GetCommunityOrganizerHandler $site, CommunityContactHandler $handler): JsonResponse
    {
        $handler->submit($site->handle()->getId(), $request->safe()->except('website'));

        return $this->jsonResponse(['data' => ['received' => true]], 201);
    }
}
