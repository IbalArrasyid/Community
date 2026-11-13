import assert from 'node:assert/strict';
import {test} from 'node:test';
import {openSupportWidget, supportChatConfiguration} from '../src/utilites/supportChat.ts';

test('live chat remains unconfigured without a website token', () => {
    assert.equal(supportChatConfiguration(undefined, undefined), null);
    assert.equal(supportChatConfiguration('https://support.example.com', '   '), null);
});

test('a website token can use the existing default Chatwoot host', () => {
    assert.deepEqual(supportChatConfiguration(undefined, ' website-token '), {
        baseUrl: 'https://app.chatwoot.com', websiteToken: 'website-token',
    });
});

test('self-hosted HTTPS origins are normalized without changing their identity', () => {
    assert.deepEqual(supportChatConfiguration('https://support.example.com/', 'token'), {
        baseUrl: 'https://support.example.com', websiteToken: 'token',
    });
});

test('invalid script origins and URLs with credentials or query data are rejected', () => {
    for (const url of ['not a url', 'javascript:alert(1)', 'http://support.example.com', 'https://user:pass@support.example.com', 'https://support.example.com?token=private', 'https://support.example.com#fragment']) {
        assert.equal(supportChatConfiguration(url, 'token'), null);
    }
});

test('opening support during SSR does not access browser globals', () => {
    assert.doesNotThrow(() => openSupportWidget());
});
