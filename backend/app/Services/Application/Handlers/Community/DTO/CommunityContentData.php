<?php

namespace HiEvents\Services\Application\Handlers\Community\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class CommunityContentData extends BaseDataObject
{
    public function __construct(
        public int $id,
        public int $organizer_id,
        public string $type,
        public string $slug,
        public string $title,
        public ?string $summary,
        public string $body,
        public ?int $cover_image_id,
        public string $status,
        public ?string $published_at,
        public ?string $seo_title,
        public ?string $seo_description,
    ) {}
}
