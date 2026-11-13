<?php

namespace HiEvents\Services\Application\Handlers\Community\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class CommunityContactData extends BaseDataObject
{
    public function __construct(
        public int $id,
        public int $organizer_id,
        public string $name,
        public string $email,
        public string $subject,
        public string $message,
        public ?string $read_at,
        public string $created_at,
    ) {}
}
