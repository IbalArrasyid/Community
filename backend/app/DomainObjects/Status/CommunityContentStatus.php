<?php

namespace HiEvents\DomainObjects\Status;

enum CommunityContentStatus: string
{
    case DRAFT = 'DRAFT';
    case PUBLISHED = 'PUBLISHED';
}
