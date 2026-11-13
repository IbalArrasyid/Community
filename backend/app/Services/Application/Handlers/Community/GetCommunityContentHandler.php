<?php

namespace HiEvents\Services\Application\Handlers\Community;

use HiEvents\Repository\Eloquent\CommunityContentRepository;
use HiEvents\Services\Application\Handlers\Community\DTO\CommunityContentData;
use Illuminate\Pagination\LengthAwarePaginator;

class GetCommunityContentHandler
{
    public function __construct(private readonly CommunityContentRepository $repository) {}

    public function list(int $organizerId, ?string $type, bool $publishedOnly, int $page, string $search = '', string $sort = 'newest'): LengthAwarePaginator
    {
        return $this->repository->paginate($organizerId, $type, $publishedOnly, $page, $search, $sort);
    }

    public function find(int $organizerId, int|string $key, bool $publishedOnly = false, ?string $type = null): CommunityContentData
    {
        return $this->repository->find($organizerId, $key, $publishedOnly, $type);
    }
}
