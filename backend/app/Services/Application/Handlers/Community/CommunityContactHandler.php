<?php

namespace HiEvents\Services\Application\Handlers\Community;

use HiEvents\Repository\Eloquent\CommunityContactRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class CommunityContactHandler
{
    public function __construct(private readonly CommunityContactRepository $repository) {}

    public function submit(int $organizerId, array $attributes): void
    {
        $this->repository->create($organizerId, $attributes);
    }

    public function list(int $organizerId, int $page): LengthAwarePaginator
    {
        return $this->repository->paginate($organizerId, $page);
    }

    public function markRead(int $organizerId, int $id): void
    {
        $this->repository->markRead($organizerId, $id);
    }
}
