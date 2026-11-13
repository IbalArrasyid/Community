import test from 'node:test';
import assert from 'node:assert/strict';
import {communityEventSchedule} from '../src/utilites/communityEventSchedule.ts';

test('uses the occurrence projection instead of legacy event dates', () => {
    const result = communityEventSchedule({start_date: '2000-01-01', next_occurrence_start_date: '2027-04-10T10:00:00Z'});
    assert.equal(result.start, '2027-04-10T10:00:00Z');
    assert.equal(result.end, null);
});

test('sorts usable occurrences and excludes past, cancelled and invalid dates', () => {
    const result = communityEventSchedule({occurrences: [
        {start_date: '2027-04-12T10:00:00Z'},
        {start_date: '2027-04-08T10:00:00Z', status: 'CANCELLED'},
        {start_date: '2027-04-07T10:00:00Z', is_past: true},
        {start_date: 'invalid'},
        {start_date: '2027-04-10T10:00:00Z', end_date: '2027-04-10T12:00:00Z'},
    ]});
    assert.equal(result.start, '2027-04-10T10:00:00Z');
    assert.equal(result.end, '2027-04-10T12:00:00Z');
});

test('missing dates stay unannounced and invalid end dates are omitted', () => {
    assert.equal(communityEventSchedule({start_date: '2027-04-10'}).start, null);
    assert.equal(communityEventSchedule({occurrences: [{start_date: '2027-04-10', end_date: '2027-04-09'}]}).end, null);
});
