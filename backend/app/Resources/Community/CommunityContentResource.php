<?php

namespace HiEvents\Resources\Community;

class CommunityContentResource extends CommunityContentPublicResource
{
    /**
     * @return array{id: int, type: 'PAGE'|'ARTICLE', slug: string, title: string, summary: ?string, body: string, cover_image: ?\HiEvents\Resources\Image\ImageResource, published_at: ?string, seo_title: ?string, seo_description: ?string, organizer_id: int, status: 'DRAFT'|'PUBLISHED', cover_image_id: ?int}
     */
    public function toArray($request): array
    {
        return [
            ...parent::toArray($request),
            'organizer_id' => $this->organizer_id,
            'status' => $this->status,
            'cover_image_id' => $this->cover_image_id,
        ];
    }
}
