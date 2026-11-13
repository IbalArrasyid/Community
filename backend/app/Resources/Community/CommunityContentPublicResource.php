<?php

namespace HiEvents\Resources\Community;

use Carbon\CarbonImmutable;
use HiEvents\DomainObjects\Enums\ImageType;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Repository\Interfaces\ImageRepositoryInterface;
use HiEvents\Resources\Image\ImageResource;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityContentPublicResource extends JsonResource
{
    /**
     * @return array{id: int, type: 'PAGE'|'ARTICLE', slug: string, title: string, summary: ?string, body: string, cover_image: ?ImageResource, published_at: ?string, seo_title: ?string, seo_description: ?string}
     */
    public function toArray($request): array
    {
        $image = $this->cover_image_id === null ? null : app(ImageRepositoryInterface::class)->findFirstWhere([
            'id' => $this->cover_image_id,
            'entity_id' => $this->organizer_id,
            'entity_type' => OrganizerDomainObject::class,
            'type' => ImageType::ORGANIZER_GALLERY->name,
        ]);

        return [
            'id' => $this->id,
            'type' => $this->type,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'body' => $this->body,
            'cover_image' => $image === null ? null : new ImageResource($image),
            'published_at' => $this->published_at === null ? null : CarbonImmutable::parse($this->published_at, 'UTC')->toIso8601String(),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
        ];
    }
}
