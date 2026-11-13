<?php

namespace HiEvents\Repository\Eloquent;

use Closure;
use HiEvents\DomainObjects\Status\CommunityContentStatus;
use HiEvents\Services\Application\Handlers\Community\DTO\CommunityContentData;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class CommunityContentRepository
{
    public function __construct(private readonly DatabaseManager $db) {}

    public function paginate(int $organizerId, ?string $type, bool $publishedOnly, int $page): LengthAwarePaginator
    {
        return $this->runQuery(function (Builder $query) use ($organizerId, $type, $publishedOnly, $page) {
            $this->scope($query, $organizerId, $publishedOnly);
            $query->when($type !== null, fn (Builder $query) => $query->where('type', $type));

            return $query->orderByDesc('published_at')->orderByDesc('id')
                ->paginate(12, ['*'], 'page', $page)
                ->through(fn (object $row) => CommunityContentData::from((array) $row));
        });
    }

    public function find(int $organizerId, int|string $key, bool $publishedOnly = false, ?string $type = null): CommunityContentData
    {
        return $this->runQuery(function (Builder $query) use ($organizerId, $key, $publishedOnly, $type) {
            $this->scope($query, $organizerId, $publishedOnly);
            $query->where(is_int($key) ? 'id' : 'slug', $key);
            $query->when($type !== null, fn (Builder $query) => $query->where('type', $type));

            $row = $query->first();
            if ($row === null) {
                throw (new ModelNotFoundException)->setModel('community_contents');
            }

            return CommunityContentData::from((array) $row);
        });
    }

    public function save(int $organizerId, array $attributes, ?int $id): CommunityContentData
    {
        return $this->db->transaction(fn () => $this->runQuery(function (Builder $query) use ($organizerId, $attributes, $id) {
            $attributes['updated_at'] = now();
            if ($id === null) {
                $id = (int) $query->insertGetId([...$attributes, 'organizer_id' => $organizerId, 'created_at' => now()]);
            } else {
                $this->find($organizerId, $id);
                $query->where('organizer_id', $organizerId)->where('id', $id)->update($attributes);
            }

            return $this->find($organizerId, $id);
        }));
    }

    private function scope(Builder $query, int $organizerId, bool $publishedOnly): void
    {
        $query->where('organizer_id', $organizerId);
        if ($publishedOnly) {
            $query->where('status', CommunityContentStatus::PUBLISHED->value)
                ->whereNotNull('published_at')->where('published_at', '<=', now());
        }
    }

    private function runQuery(Closure $callback): mixed
    {
        return $callback($this->db->table('community_contents'));
    }
}
