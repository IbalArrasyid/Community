<?php

namespace HiEvents\Services\Application\Handlers\Community;

use Carbon\CarbonImmutable;
use HiEvents\DomainObjects\Enums\ImageType;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\Status\CommunityContentStatus;
use HiEvents\Repository\Eloquent\CommunityContentRepository;
use HiEvents\Repository\Interfaces\ImageRepositoryInterface;
use HiEvents\Services\Application\Handlers\Community\DTO\CommunityContentData;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;

class SaveCommunityContentHandler
{
    public function __construct(
        private readonly CommunityContentRepository $repository,
        private readonly ImageRepositoryInterface $images,
        private readonly HtmlPurifierService $purifier,
    ) {}

    public function handle(int $organizerId, array $attributes, ?int $id = null): CommunityContentData
    {
        if ($id !== null) {
            $this->repository->find($organizerId, $id);
        }

        if (! empty($attributes['cover_image_id'])) {
            $image = $this->images->findFirstWhere([
                'id' => $attributes['cover_image_id'],
                'entity_id' => $organizerId,
                'entity_type' => OrganizerDomainObject::class,
                'type' => ImageType::ORGANIZER_GALLERY->name,
            ]);
            if ($image === null) {
                throw ValidationException::withMessages(['cover_image_id' => __('validation.exists', ['attribute' => 'cover_image_id'])]);
            }
        }

        $attributes['body'] = $this->purifier->purify($attributes['body']);
        $attributes['published_at'] = $attributes['status'] === CommunityContentStatus::PUBLISHED->value
            ? CarbonImmutable::parse($attributes['published_at'] ?? 'now')->utc()
            : null;

        try {
            return $this->repository->save($organizerId, $attributes, $id);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['slug' => __('validation.unique', ['attribute' => 'slug'])]);
        }
    }
}
