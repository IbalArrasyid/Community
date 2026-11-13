<?php

use HiEvents\Http\Actions\Community\CreateCommunityContentAction;
use HiEvents\Http\Actions\Community\GetCommunityContactsAction;
use HiEvents\Http\Actions\Community\GetCommunityContentAction;
use HiEvents\Http\Actions\Community\GetCommunityContentsAction;
use HiEvents\Http\Actions\Community\MarkCommunityContactReadAction;
use HiEvents\Http\Actions\Community\UpdateCommunityContentAction;
use HiEvents\Http\Actions\Community\Public\CreateCommunityContactPublicAction;
use HiEvents\Http\Actions\Community\Public\GetCommunityContentPublicAction;
use HiEvents\Http\Actions\Community\Public\GetCommunityContentsPublicAction;
use HiEvents\Http\Actions\Community\Public\GetCommunityEventsPublicAction;
use HiEvents\Http\Actions\Community\Public\GetCommunityPublicAction;
use Illuminate\Routing\Router;

$router->prefix('/organizers/{organizer_id}/community')->middleware(['auth:api', 'cache.headers:no_store;private'])->group(function (Router $router): void {
    $router->get('/content', GetCommunityContentsAction::class);
    $router->post('/content', CreateCommunityContentAction::class);
    $router->get('/content/{content_id}', GetCommunityContentAction::class)->whereNumber('content_id');
    $router->put('/content/{content_id}', UpdateCommunityContentAction::class)->whereNumber('content_id');
    $router->get('/contacts', GetCommunityContactsAction::class);
    $router->put('/contacts/{submission_id}/read', MarkCommunityContactReadAction::class)->whereNumber('submission_id');
});

$router->prefix('/public/community')->middleware('throttle:120,1,public-community')->group(function (Router $router): void {
    $router->get('/', GetCommunityPublicAction::class);
    $router->get('/content', GetCommunityContentsPublicAction::class);
    $router->get('/content/{type}/{slug}', GetCommunityContentPublicAction::class);
    $router->get('/events', GetCommunityEventsPublicAction::class);
    $router->post('/contact', CreateCommunityContactPublicAction::class)->middleware('throttle:5,60,community-contact');
});
