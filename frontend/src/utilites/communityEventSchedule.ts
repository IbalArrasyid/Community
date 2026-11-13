interface ScheduleSource {
    next_occurrence_start_date?: string | null;
    occurrences?: {start_date: string; end_date?: string; is_past?: boolean; status?: string}[];
}

export const communityEventSchedule = (event: ScheduleSource) => {
    const occurrences = (event.occurrences ?? [])
        .filter(item => !item.is_past && item.status !== 'CANCELLED' && Number.isFinite(Date.parse(item.start_date)))
        .sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date));
    const next = event.next_occurrence_start_date;
    const start = next && Number.isFinite(Date.parse(next)) ? next : occurrences[0]?.start_date ?? null;
    const occurrence = occurrences.find(item => item.start_date === start || Date.parse(item.start_date) === Date.parse(start ?? ''));
    const end = occurrence?.end_date;
    return {
        start,
        end: start && end && Date.parse(end) > Date.parse(start) ? end : null,
        hasEnded: false,
        isSeriesRange: false,
        isHappeningNow: false,
        additionalDateCount: 0,
    };
};
