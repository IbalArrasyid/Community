import {LoaderFunctionArgs} from "react-router";
import {getQueryClient} from "../utilites/ssrQueryClient";
import {communityArticlesQuery, communityContentQuery, communityEventsQuery, communitySiteQuery} from "../queries/useCommunity";

export const communityRouteLoader = async ({request, params}: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const page = Math.max(1, Math.min(100000, Math.floor(Number(url.searchParams.get('page')) || 1)));
    const query = url.searchParams.get('q') ?? '';
    const articleQuery = query.trim().slice(0, 200);
    const articleSort = url.searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';
    const client = getQueryClient();
    const organizer = await client.fetchQuery(communitySiteQuery());
    if (!organizer) return {organizer: null, content: null, articles: null, events: null};

    const isArticleDetail = url.pathname.startsWith('/articles/');
    const type = isArticleDetail ? 'ARTICLE' : 'PAGE';
    const slug = params.slug ?? ({'/': 'home', '/about': 'about', '/contact': 'contact', '/articles': 'articles', '/events': 'events'}[url.pathname]);
    const [content, articles, events] = await Promise.all([
        slug ? client.fetchQuery(communityContentQuery(type, slug)) : null,
        isArticleDetail ? client.fetchQuery(communityArticlesQuery()).catch(() => null) : ['/', '/articles'].includes(url.pathname) ? client.fetchQuery(communityArticlesQuery(page, url.pathname === '/articles' ? articleQuery : '', url.pathname === '/articles' ? articleSort : 'newest')) : null,
        ['/', '/events'].includes(url.pathname) ? client.fetchQuery(communityEventsQuery(page, url.pathname === '/events' ? articleQuery : '')) : null,
    ]);

    if (params.slug && !content) throw new Response(null, {status: 404});
    return {organizer, content, articles, events};
};
