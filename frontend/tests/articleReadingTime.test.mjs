import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateArticleReadingMinutes} from '../src/utilites/articleReadingTime.ts';

test('empty editorial content has no reading-time badge', () => {
    for (const text of [null, undefined, '', '  \n\t ']) {
        assert.equal(estimateArticleReadingMinutes(text), 0);
    }
});

test('reading time rounds up at the 200-word editorial estimate', () => {
    assert.equal(estimateArticleReadingMinutes('community '.repeat(200)), 1);
    assert.equal(estimateArticleReadingMinutes('community '.repeat(201)), 2);
    assert.equal(estimateArticleReadingMinutes('community '.repeat(400)), 2);
    assert.equal(estimateArticleReadingMinutes('community '.repeat(401)), 3);
});

test('paragraph whitespace does not inflate the estimate', () => {
    assert.equal(estimateArticleReadingMinutes('Community\n\n  stories\tand\nideas'), 1);
});
