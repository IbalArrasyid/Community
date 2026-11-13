import {useMutation, useQueryClient} from "@tanstack/react-query";
import {communityClient, CommunityContactInput, CommunityContentInput} from "../api/community.client";
import {IdParam} from "../types";

export const useSaveCommunityContent = (organizerId: IdParam) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}: {id?: number; data: CommunityContentInput}) => communityClient.save(organizerId, id, data),
        onSuccess: async () => {
            await Promise.all([
                client.invalidateQueries({queryKey: ['community-admin', organizerId, 'content']}),
                client.invalidateQueries({queryKey: ['community']}),
            ]);
        },
    });
};

export const useSendCommunityContact = () => useMutation({
    mutationFn: (data: CommunityContactInput) => communityClient.contact(data),
});

export const useReadCommunityContact = (organizerId: IdParam) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => communityClient.markRead(organizerId, id),
        onSuccess: () => client.invalidateQueries({queryKey: ['community-admin', organizerId, 'inbox']}),
    });
};
