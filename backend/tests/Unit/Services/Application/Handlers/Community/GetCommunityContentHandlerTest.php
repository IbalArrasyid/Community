<?php

namespace Tests\Unit\Services\Application\Handlers\Community;

use HiEvents\Repository\Eloquent\CommunityContentRepository;
use HiEvents\Services\Application\Handlers\Community\GetCommunityContentHandler;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class GetCommunityContentHandlerTest extends TestCase
{
    public function test_listing_keeps_the_existing_default_query(): void
    {
        $repository = Mockery::mock(CommunityContentRepository::class);
        $result = Mockery::mock(LengthAwarePaginator::class);
        $repository->shouldReceive('paginate')->once()->with(12, 'ARTICLE', true, 1, '', 'newest')->andReturn($result);

        $this->assertSame($result, (new GetCommunityContentHandler($repository))->list(12, 'ARTICLE', true, 1));
    }

    public function test_listing_forwards_search_sort_page_and_publication_scope(): void
    {
        $repository = Mockery::mock(CommunityContentRepository::class);
        $result = Mockery::mock(LengthAwarePaginator::class);
        $repository->shouldReceive('paginate')->once()->with(12, 'ARTICLE', true, 3, 'workshop', 'oldest')->andReturn($result);

        $this->assertSame($result, (new GetCommunityContentHandler($repository))->list(12, 'ARTICLE', true, 3, 'workshop', 'oldest'));
    }
}
