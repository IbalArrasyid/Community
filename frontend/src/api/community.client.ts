import {api} from "./client";
import {publicApi} from "./public-client";
import {Event, GenericDataResponse, GenericPaginatedResponse, IdParam, Image, Organizer} from "../types";
import {queryParamsHelper} from "../utilites/queryParamsHelper";

export type CommunityContentType = 'PAGE' | 'ARTICLE';
export interface CommunityContentInput {
    type: CommunityContentType;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    cover_image_id: number | null;
    status: 'DRAFT' | 'PUBLISHED';
    published_at: string | null;
    seo_title: string | null;
    seo_description: string | null;
}

export interface CommunityContent extends Omit<CommunityContentInput, 'cover_image_id' | 'status'> {
    id: number;
    cover_image: Image | null;
    cover_image_id?: number | null;
    status?: 'DRAFT' | 'PUBLISHED';
}

export interface CommunityContactInput {
    name: string;
    email: string;
    subject: string;
    message: string;
    website: string;
}

export interface CommunityContact extends Omit<CommunityContactInput, 'website'> {
    id: number;
    read_at: string | null;
    created_at: string;
}

const path = (id: IdParam) => 'organizers/' + id + '/community';

export const communityClient = {
    site: async () => (await publicApi.get<GenericDataResponse<Organizer>>('/community')).data.data,
    content: async (type: CommunityContentType, slug: string) =>
        (await publicApi.get<GenericDataResponse<CommunityContent>>('/community/content/' + type + '/' + encodeURIComponent(slug))).data.data,
    articles: async (page: number, query = '', sort: 'newest' | 'oldest' = 'newest') =>
        (await publicApi.get<GenericPaginatedResponse<CommunityContent>>('/community/content', {params: {type: 'ARTICLE', page, q: query, sort}})).data,
    events: async (page: number, query: string) =>
        (await publicApi.get<GenericPaginatedResponse<Event>>('/community/events' + queryParamsHelper.buildQueryString({
            pageNumber: page,
            perPage: 12,
            query,
            sortBy: 'start_date',
            sortDirection: 'asc',
            additionalParams: {eventsStatus: 'upcoming'},
        }))).data,
    contact: async (data: CommunityContactInput) => (await publicApi.post<{data: {received: boolean}}>('/community/contact', data)).data,
    list: async (id: IdParam, page: number) =>
        (await api.get<GenericPaginatedResponse<CommunityContent>>(path(id) + '/content', {params: {page}})).data,
    save: async (id: IdParam, contentId: number | undefined, data: CommunityContentInput) =>
        contentId
            ? (await api.put<GenericDataResponse<CommunityContent>>(path(id) + '/content/' + contentId, data)).data.data
            : (await api.post<GenericDataResponse<CommunityContent>>(path(id) + '/content', data)).data.data,
    inbox: async (id: IdParam, page: number) =>
        (await api.get<GenericPaginatedResponse<CommunityContact>>(path(id) + '/contacts', {params: {page}})).data,
    markRead: async (id: IdParam, submissionId: number) =>
        (await api.put(path(id) + '/contacts/' + submissionId + '/read')).data,
};
