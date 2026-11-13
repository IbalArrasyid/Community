<?php

namespace HiEvents\Http\Request\Community;

use HiEvents\DomainObjects\Enums\CommunityContentType;
use HiEvents\DomainObjects\Status\CommunityContentStatus;
use HiEvents\Http\Request\BaseRequest;
use Illuminate\Validation\Rule;

class SaveCommunityContentRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(CommunityContentType::class)],
            'slug' => ['required', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'title' => ['required', 'string', 'max:200'],
            'summary' => ['nullable', 'string', 'max:1000'],
            'body' => ['required', 'string', 'max:100000'],
            'cover_image_id' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::enum(CommunityContentStatus::class)],
            'published_at' => ['nullable', 'date_format:Y-m-d\TH:i:sP'],
            'seo_title' => ['nullable', 'string', 'max:200'],
            'seo_description' => ['nullable', 'string', 'max:320'],
        ];
    }
}
