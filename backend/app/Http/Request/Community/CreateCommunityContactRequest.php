<?php

namespace HiEvents\Http\Request\Community;

use HiEvents\Http\Request\BaseRequest;
use HiEvents\Validators\Rules\PersonNameRule;

class CreateCommunityContactRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', new PersonNameRule],
            'email' => ['required', 'email:rfc', 'max:254'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'website' => ['nullable', 'string', 'size:0'],
        ];
    }
}
