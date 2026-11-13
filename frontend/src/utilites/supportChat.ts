export const OPEN_SUPPORT_EVENT = 'community:open-support';

export type SupportChatConfiguration = {baseUrl: string; websiteToken: string};

export const supportChatConfiguration = (baseUrl: string | undefined, websiteToken: string | undefined): SupportChatConfiguration | null => {
    const token = websiteToken?.trim();
    if (!token) return null;
    try {
        const url = new URL(baseUrl?.trim() || 'https://app.chatwoot.com');
        if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
        return {baseUrl: url.toString().replace(/\/+$/, ''), websiteToken: token};
    } catch {
        return null;
    }
};

export const openSupportWidget = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_SUPPORT_EVENT));
};
