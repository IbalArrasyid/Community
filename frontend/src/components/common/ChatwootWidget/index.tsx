import {useEffect, useState} from 'react';
import {Alert, Button} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconMessageCircle} from '@tabler/icons-react';
import {getConfig} from '../../../utilites/config';
import {OPEN_SUPPORT_EVENT, SupportChatConfiguration, supportChatConfiguration} from '../../../utilites/supportChat';
import {CommunityContactForm} from '../CommunityContactForm';
import {Modal} from '../Modal';
import classes from './ChatwootWidget.module.scss';

interface ChatwootSdk {
    run: (options: {websiteToken: string; baseUrl: string}) => void;
}

interface ChatwootApi {
    toggle: (state: 'open' | 'close') => void;
}

declare global {
    interface Window {
        chatwootSDK?: ChatwootSdk;
        $chatwoot?: ChatwootApi;
        chatwootSettings?: Record<string, unknown>;
    }
}

const ChatwootWidget = () => {
    const [configuration, setConfiguration] = useState<SupportChatConfiguration | null>(null);
    const [requestCount, setRequestCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fallbackOpen, setFallbackOpen] = useState(false);
    const [unavailable, setUnavailable] = useState(false);

    useEffect(() => {
        setConfiguration(supportChatConfiguration(getConfig('VITE_CHATWOOT_BASE_URL'), getConfig('VITE_CHATWOOT_WEBSITE_TOKEN')));
        const open = () => setRequestCount(count => count + 1);
        window.addEventListener(OPEN_SUPPORT_EVENT, open);
        return () => window.removeEventListener(OPEN_SUPPORT_EVENT, open);
    }, []);

    useEffect(() => {
        if (requestCount === 0) return;
        setUnavailable(false);
        if (!configuration) {
            setLoading(false);
            setFallbackOpen(true);
            return;
        }
        setFallbackOpen(false);
        if (window.$chatwoot) {
            setLoading(false);
            try {
                window.$chatwoot.toggle('open');
            } catch {
                setUnavailable(true);
                setFallbackOpen(true);
            }
            return;
        }

        let active = true;
        let timer: number | undefined;
        setLoading(true);
        const fail = () => {
            if (!active) return;
            active = false;
            window.clearTimeout(timer);
            setLoading(false);
            setUnavailable(true);
            setFallbackOpen(true);
        };
        const ready = () => {
            if (!active || !window.$chatwoot) return;
            try {
                window.$chatwoot.toggle('open');
                active = false;
                window.clearTimeout(timer);
                setLoading(false);
            } catch {
                fail();
            }
        };
        let script = document.getElementById('chatwoot-script') as HTMLScriptElement | null;
        const start = () => {
            if (!active || !script || script.dataset.started === 'true') return;
            if (!window.chatwootSDK) {
                fail();
                return;
            }
            try {
                script.dataset.started = 'true';
                window.chatwootSDK.run({websiteToken: configuration.websiteToken, baseUrl: configuration.baseUrl});
            } catch {
                fail();
            }
        };
        const scriptError = () => {
            script?.remove();
            fail();
        };

        window.chatwootSettings = {...window.chatwootSettings, hideMessageBubble: true, showUnreadMessagesDialog: false, position: 'right'};
        window.addEventListener('chatwoot:ready', ready);
        timer = window.setTimeout(fail, 15000);
        if (!script) {
            script = document.createElement('script');
            script.id = 'chatwoot-script';
            script.src = configuration.baseUrl + '/packs/js/sdk.js';
            script.async = true;
            script.addEventListener('load', start);
            script.addEventListener('error', scriptError);
            document.body.appendChild(script);
        } else {
            script.addEventListener('load', start);
            script.addEventListener('error', scriptError);
            if (window.chatwootSDK) start();
        }

        return () => {
            active = false;
            window.clearTimeout(timer);
            window.removeEventListener('chatwoot:ready', ready);
            script?.removeEventListener('load', start);
            script?.removeEventListener('error', scriptError);
        };
    }, [configuration, requestCount]);

    return <>
        <aside aria-label={t`Contact`}>
        <Button type="button" className={classes.launcher} radius="xl" loading={loading}
            leftSection={<IconMessageCircle size={23} aria-hidden="true" />}
            aria-label={configuration ? t`Live chat` : t`Contact`}
            onClick={() => setRequestCount(count => count + 1)}>
            <span>{configuration ? t`Live chat` : t`Contact`}</span>
        </Button>
        </aside>
        <Modal opened={fallbackOpen} onClose={() => setFallbackOpen(false)} heading={t`Contact`} size="md">
            {unavailable && <Alert className={classes.error} color="orange" role="alert">{t`Live chat is unavailable. Please send us a message.`}</Alert>}
            <p className={classes.introduction}>{t`Ask us about events, tickets, or partnerships.`}</p>
            <CommunityContactForm onCancel={() => setFallbackOpen(false)} />
        </Modal>
    </>;
};

export default ChatwootWidget;
