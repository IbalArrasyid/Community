import {useQuery} from "@tanstack/react-query";
import {isAxiosError} from "axios";
import {communityClient, CommunityContentType} from "../api/community.client";
import {IdParam} from "../types";

export const communitySiteQuery = () => ({
    queryKey: ['community', 'site'],
    queryFn: async () => {
        try {
            return await communityClient.site();
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) return null;
            throw error;
        }
    },
    staleTime: 0,
    retry: false,
});

export const communityContentQuery = (type: CommunityContentType, slug: string) => ({
    queryKey: ['community', 'content', type, slug],
    queryFn: async () => {
        try {
            return await communityClient.content(type, slug);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) return null;
            throw error;
        }
    },
    staleTime: 0,
    retry: false,
});

export const communityArticlesQuery = (page = 1, query = '', sort: 'newest' | 'oldest' = 'newest') => ({
    queryKey: ['community', 'articles', page, query, sort],
    queryFn: () => communityClient.articles(page, query, sort),
    staleTime: 0,
});

export const communityEventsQuery = (page = 1, query = '') => ({
    queryKey: ['community', 'events', page, query],
    queryFn: () => communityClient.events(page, query),
    staleTime: 0,
});

export const useCommunityContents = (id: IdParam, page: number, enabled: boolean) => useQuery({
    queryKey: ['community-admin', id, 'content', page],
    queryFn: () => communityClient.list(id, page),
    enabled,
});

export const useCommunityInbox = (id: IdParam, page: number, enabled: boolean) => useQuery({
    queryKey: ['community-admin', id, 'inbox', page],
    queryFn: () => communityClient.inbox(id, page),
    enabled,
});
