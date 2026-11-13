import {Button, Pagination, TextInput} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconArrowRight, IconCalendarEvent, IconChevronRight, IconMapPin, IconSearch, IconTicket} from '@tabler/icons-react';
import {Form, Link, useNavigate, useNavigation, useSearchParams} from 'react-router';
import {CommunityContent} from '../../../api/community.client';
import {Event, GenericPaginatedResponse, LocationType} from '../../../types';
import {communityEventSchedule} from '../../../utilites/communityEventSchedule';
import {summariseEventPrice} from '../../../utilites/eventListing';
import {eventPriceLabel, eventScheduleLabel} from '../../../utilites/eventListingLabels';
import {buildEventLocationDisplay, summariseEventLocations} from '../../../utilites/effectiveLocation';
import {decodeHtmlEntities} from '../../../utilites/htmlEntities';
import {responsiveImage} from '../../../utilites/imageTransform';
import {eventHomepagePath} from '../../../utilites/urlHelper';
import {UserGeneratedContent} from '../../common/UserGeneratedContent';
import classes from './Community.module.scss';

const EventCard = ({event, featured = false}: {event: Event; featured?: boolean}) => {
    const cover = event.images?.find(image => image.type === 'EVENT_COVER');
    const schedule = communityEventSchedule(event);
    const price = summariseEventPrice(event);
    const locations = summariseEventLocations(event);
    const location = locations.kind === 'single' ? buildEventLocationDisplay(event, locations.eventLocation, false) : null;
    const venue = locations.kind === 'varied' ? t`Multiple locations`
        : locations.kind === 'single' && locations.eventLocation.type === LocationType.Online ? t`Online event`
        : location?.venueName || location?.short;
    const path = eventHomepagePath(event);

    return <article className={featured ? classes.eventFeatured : classes.eventCard}>
        <Link to={path} className={classes.eventArtwork} tabIndex={-1} aria-hidden="true">
            {cover ? <img {...responsiveImage(cover.url, featured ? '(max-width: 700px) 100vw, 55vw' : '(max-width: 700px) 100vw, 33vw')} alt="" loading={featured ? 'eager' : 'lazy'} fetchPriority={featured ? 'high' : 'auto'} />
                : <IconCalendarEvent size={72} stroke={1} />}
        </Link>
        <div className={classes.eventCardBody}>
            <span className={classes.eyebrow}>Barter Up · {t`Events`}</span>
            <h3><Link to={path}>{event.title}</Link></h3>
            <div className={classes.eventMeta}>
                <p><IconCalendarEvent size={18} aria-hidden="true" /><span>{eventScheduleLabel(schedule, event.timezone)}</span></p>
                {venue && <p><IconMapPin size={18} aria-hidden="true" /><span>{venue}</span></p>}
            </div>
            {event.description_preview && <p className={classes.eventDescription}>{decodeHtmlEntities(event.description_preview)}</p>}
            <div className={classes.eventCardFooter}>
                {price && <strong><IconTicket size={18} aria-hidden="true" />{eventPriceLabel(price, event.currency)}</strong>}
                <Button component={Link} to={path} variant={featured ? 'filled' : 'light'} radius="md" rightSection={<IconArrowRight size={17} aria-hidden="true" />} aria-label={t`View event` + ': ' + event.title}>{t`View event`}</Button>
            </div>
        </div>
    </article>;
};

export const EventsPage = ({events, content}: {events: GenericPaginatedResponse<Event> | null; content: CommunityContent | null}) => {
    const [search] = useSearchParams();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const query = (search.get('q') ?? '').trim().slice(0, 200);
    const pending = navigation.state !== 'idle' && navigation.location?.pathname === '/events';
    const items = events?.data ?? [];
    const featured = !query && events?.meta.current_page === 1 ? items[0] : undefined;
    const cards = featured ? items.slice(1) : items;

    return <div className={classes.eventsPage}>
        <nav className={classes.articleBreadcrumb} aria-label={t`Navigation`}><Link to="/">{t`Home`}</Link><IconChevronRight size={14} aria-hidden="true" /><span aria-current="page">{t`Events`}</span></nav>
        <section className={classes.articlesHero}>
            <span className={classes.heroBadge}><IconCalendarEvent size={16} aria-hidden="true" />Barter Up · {t`Community`}</span>
            <h1>{content?.title || t`Explore events`}</h1>
            <p>{content?.summary || t`Discover community events and book your tickets directly with Barter Up.`}</p>
            <Form method="get" action="/events" key={query} className={classes.eventSearch} aria-label={t`Search events`}>
                <TextInput name="q" label={t`Search events`} defaultValue={query} maxLength={200} leftSection={<IconSearch size={18} aria-hidden="true" />} />
                <Button type="submit" radius="md" loading={pending}>{t`Search`}</Button>
                {query && <Link to="/events">{t`Reset`}</Link>}
            </Form>
        </section>
        <section className={classes.articleResults} aria-label={t`Upcoming events`} aria-busy={pending}>
            <div className={classes.sectionHeading}><h2>{t`Upcoming events`}</h2>{events && <span className={classes.articleCount}>{events.meta.total}</span>}</div>
            {featured && <EventCard event={featured} featured />}
            {cards.length > 0 && <div className={classes.eventGrid}>{cards.map(event => <EventCard key={event.id} event={event} />)}</div>}
            {!items.length && <div className={classes.articleEmpty} role="status"><IconCalendarEvent size={44} aria-hidden="true" /><p>{t`No upcoming events yet.`}</p>{query && <Button component={Link} to="/events" variant="light">{t`Reset`}</Button>}</div>}
            {events && events.meta.last_page > 1 && <Pagination total={events.meta.last_page} value={events.meta.current_page} disabled={pending} onChange={page => {
                const next = new URLSearchParams(search);
                next.set('page', String(page));
                navigate('/events?' + next.toString());
            }} />}
        </section>
        {content?.body && <section className={classes.section}><UserGeneratedContent className={classes.prose} html={content.body} /></section>}
        <section className={classes.callout}><span className={classes.eyebrow}>Barter Up · {t`Community`}</span><h2>{t`Meet, connect, and grow together.`}</h2><Button component={Link} to="/contact" radius="md" rightSection={<IconArrowRight size={18} aria-hidden="true" />}>{t`Contact`}</Button></section>
    </div>;
};
