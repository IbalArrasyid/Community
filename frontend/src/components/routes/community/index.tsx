import {useLoaderData, Link, NavLink, useLocation, useSearchParams} from "react-router";
import {Button, Container, Group, Stack, Alert} from "@mantine/core";
import {t} from "@lingui/macro";
import {Helmet} from "react-helmet-async";
import {CommunityContent} from "../../../api/community.client";
import {communityRouteLoader} from "../../../routeLoaders/communityRouteLoader";
import {getConfig} from "../../../utilites/config";
import {UserGeneratedContent} from "../../common/UserGeneratedContent";
import {PoweredByFooter} from "../../common/PoweredByFooter";
import {EventList} from "../../layouts/OrganizerHomepage/EventList";
import {IconArrowRight, IconTicket, IconQrcode, IconUsers, IconCalendarEvent} from "@tabler/icons-react";
import {AboutPage} from "./AboutPage";
import {ArticlesPage} from "./ArticlesPage";
import {ArticleDetail} from "./ArticleDetail";
import {EventsPage} from "./EventsPage";
import {ContactPage} from "./ContactPage";
import classes from "./Community.module.scss";

const ContentBody = ({content}: {content: CommunityContent}) => (
    <>
        {content.cover_image && <img className={classes.cover} src={content.cover_image.url} alt="" />}
        <UserGeneratedContent className={classes.prose} html={content.body} />
    </>
);

const ArticleCards = ({articles}: {articles: CommunityContent[]}) => articles.length ? (
    <div className={classes.grid}>
        {articles.map(article => (
            <article className={classes.card} key={article.id}>
                {article.cover_image && <img src={article.cover_image.url} alt="" loading="lazy" />}
                <div>
                    <h3><Link to={'/articles/' + article.slug}>{article.title}</Link></h3>
                    {article.summary && <p>{article.summary}</p>}
                </div>
            </article>
        ))}
    </div>
) : <p className={classes.empty}>{t`No articles published yet.`}</p>;

const Community = () => {
    const {organizer, content, articles, events} = useLoaderData<typeof communityRouteLoader>();
    const {pathname} = useLocation();
    const [search] = useSearchParams();
    const isHome = pathname === '/';
    const isEvents = pathname === '/events';
    const isArticles = pathname === '/articles';
    const isContact = pathname === '/contact';
    const title = content?.title ?? (isHome ? 'Barter Up'
        : isEvents ? t`Events` : isArticles ? t`Articles & guides` : isContact ? t`Contact` : t`About`);
    const heroImage = content?.cover_image?.url ?? organizer?.images?.find(image => image.type === 'ORGANIZER_COVER')?.url;
    const canonical = new URL(pathname, getConfig('VITE_FRONTEND_URL') || 'http://localhost:5678').toString();
    const description = content?.seo_description || content?.summary || organizer?.settings?.seo_description || (isHome ? t`Discover community events and book your tickets directly with Barter Up.` : isArticles ? t`Stories and practical ideas for your next community event.` : organizer?.name || title);


    return (
        <div className={classes.site}>
            <Helmet>
                <title>{content?.seo_title || (isHome ? title : title + ' · ' + (organizer?.name ?? t`Community`))}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonical} />
                <meta property="og:title" content={content?.seo_title || title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonical} />
                <meta property="og:type" content={content?.type === 'ARTICLE' ? 'article' : 'website'} />
                {content?.type === 'ARTICLE' && content.published_at && <meta property="article:published_time" content={content.published_at} />}
                {heroImage && <meta property="og:image" content={heroImage} />}
                <meta name="robots" content={organizer && organizer.settings?.allow_search_engine_indexing !== false ? ((isArticles || isEvents) && search.get('q') ? 'noindex, follow' : 'index, follow') : 'noindex, nofollow'} />
            </Helmet>
            <a className={classes.skip} href="#community-main">{t`Skip to content`}</a>
            <Container size="lg">
                <header className={classes.header}>
                    <Link className={classes.brand} to="/"><span className={classes.brandIcon}><IconTicket aria-hidden="true" /></span><span>Barter Up<span className={classes.brandDot}>.</span></span></Link>
                    <nav aria-label={t`Navigation`}>
                        <NavLink to="/" end>{t`Home`}</NavLink>
                        <NavLink to="/about">{t`About`}</NavLink>
                        <NavLink to="/events">{t`Events`}</NavLink>
                        <NavLink to="/articles">{t`Articles`}</NavLink>
                        <NavLink to="/contact">{t`Contact`}</NavLink>
                    </nav>
                    <Button component={Link} to="/auth/login" variant="subtle">{t`Sign in`}</Button>
                </header>
                <main id="community-main" className={classes.main} tabIndex={-1}>
                    {!organizer && !isHome ? <Alert>{t`This community website is not available yet.`}</Alert> : isHome ? (
                        <>
                            <section className={classes.hero}>
                                <div className={classes.heroCopy}>
                                    <span className={classes.heroBadge}><span />Barter Up · {t`Community`}</span>
                                    <h1>{content?.title || t`Meet, connect, and grow together.`}</h1>
                                    <p>{content?.summary || t`Discover community events and book your tickets directly with Barter Up.`}</p>
                                    <Group justify="center">
                                        <Button component={Link} to="/events" color="blue" size="lg" radius="md" rightSection={<IconArrowRight size={18} />}>{t`Explore events`}</Button>
                                        <Button component={Link} to="/about" variant="default" size="lg" radius="md">{t`About`}</Button>
                                    </Group>
                                </div>
                            </section>
                            <div className={classes.highlights}>
                                {[{Icon: IconCalendarEvent, label: t`Events`}, {Icon: IconTicket, label: t`Tickets`}, {Icon: IconQrcode, label: t`Check-in`}, {Icon: IconUsers, label: t`Community`}].map(({Icon, label}) => (
                                    <div className={classes.highlight} key={label}><span><Icon aria-hidden="true" /></span><strong>{label}</strong></div>
                                ))}
                            </div>
                            {heroImage && <div className={classes.visual}><img src={heroImage} alt="" fetchPriority="high" /><span>Barter Up · {t`Community`}</span></div>}
                            {(content?.body || organizer?.description) && (
                                <section className={classes.section}>
                                    <UserGeneratedContent className={classes.prose} html={content?.body || organizer?.description || ''} />
                                </section>
                            )}
                            <section className={classes.section}>
                                <div className={classes.sectionHeading}><h2>{t`Upcoming events`}</h2><Link to="/events">{t`View all`}</Link></div>
                                {events?.data.length ? <EventList events={events.data.slice(0, 4)} /> : <p className={classes.empty}>{t`No upcoming events yet.`}</p>}
                            </section>
                            <section className={classes.section}>
                                <div className={classes.sectionHeading}><h2>{t`Articles`}</h2><Link to="/articles">{t`View all`}</Link></div>
                                <ArticleCards articles={articles?.data.slice(0, 3) ?? []} />
                            </section>
                            <section className={classes.callout}>
                                <span className={classes.eyebrow}>Barter Up · {t`Community`}</span>
                                <h2>{t`Meet, connect, and grow together.`}</h2>
                                <p>{t`Discover community events and book your tickets directly with Barter Up.`}</p>
                                <Button component={Link} to="/events" size="lg" radius="md" rightSection={<IconArrowRight size={18} />}>{t`Explore events`}</Button>
                            </section>
                        </>
                    ) : isEvents ? (
                        <EventsPage events={events} content={content} />
                    ) : isContact ? (
                        <ContactPage content={content} />
                    ) : isArticles ? (
                        <ArticlesPage articles={articles} content={content} />
                    ) : pathname.startsWith('/articles/') && content ? (
                        <ArticleDetail key={content.id} content={content} articles={articles?.data ?? []} canonical={canonical} />
                    ) : pathname === '/about' && organizer ? (
                        <AboutPage content={content} organizer={organizer} title={title} heroImage={heroImage} />
                    ) : (
                        <Stack gap="xl">
                            <div className={classes.pageHeading}><span className={classes.eyebrow}>{organizer?.name}</span><h1>{title}</h1>{content?.summary && <p>{content.summary}</p>}</div>
                            {content && <ContentBody content={content} />}

                        </Stack>
                    )}
                </main>
                <footer className={classes.footer}>
                    <span>Barter Up</span>
                    <PoweredByFooter />
                </footer>
            </Container>
        </div>
    );
};

export default Community;
