<?php

namespace HiEvents\Resources\Community;

use Illuminate\Http\Resources\Json\JsonResource;

class CommunityContactResource extends JsonResource
{
    /**
     * @return array{id: int, name: string, email: string, subject: string, message: string, read_at: ?string, created_at: string}
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
