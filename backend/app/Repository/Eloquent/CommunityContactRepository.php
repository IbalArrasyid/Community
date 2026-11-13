<?php

namespace HiEvents\Repository\Eloquent;

use Closure;
use HiEvents\Services\Application\Handlers\Community\DTO\CommunityContactData;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class CommunityContactRepository
{
    public function __construct(private readonly DatabaseManager $db) {}

    public function create(int $organizerId, array $attributes): void
    {
        $this->runQuery(fn (Builder $query) => $query->insert([
            ...$attributes,
            'organizer_id' => $organizerId,
            'created_at' => now(),
            'updated_at' => now(),
        ]));
    }

    public function paginate(int $organizerId, int $page): LengthAwarePaginator
    {
        return $this->runQuery(fn (Builder $query) => $query->where('organizer_id', $organizerId)
            ->orderByDesc('id')->paginate(20, ['*'], 'page', $page)
            ->through(fn (object $row) => CommunityContactData::from((array) $row)));
    }

    public function markRead(int $organizerId, int $id): void
    {
        $this->runQuery(function (Builder $query) use ($organizerId, $id): void {
            $query->where('organizer_id', $organizerId)->where('id', $id);
            if ($query->first() === null) {
                throw (new ModelNotFoundException)->setModel('community_contact_submissions');
            }
            $query->whereNull('read_at')->update(['read_at' => now(), 'updated_at' => now()]);
        });
    }

    private function runQuery(Closure $callback): mixed
    {
        return $callback($this->db->table('community_contact_submissions'));
    }
}
