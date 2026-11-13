import {useEffect, useRef, useState} from 'react';
import {Button, Group, TextInput} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconArrowRight, IconBook, IconBrandWhatsapp, IconChevronRight, IconClock, IconCopy, IconList, IconShare} from '@tabler/icons-react';
import {Link} from 'react-router';
import {CommunityContent} from '../../../api/community.client';
import {showError, showSuccess} from '../../../utilites/notifications';
import {estimateArticleReadingMinutes} from '../../../utilites/articleReadingTime';
import {UserGeneratedContent} from '../../common/UserGeneratedContent';
import {ArticleArtwork, articlePath, PublicationDate} from './articlePresentation';
import classes from './Community.module.scss';

type Heading = {id: string; title: string; level: number};

export const ArticleDetail = ({content, articles, canonical}: {
    content: CommunityContent;
    articles: CommunityContent[];
    canonical: string;
}) => {
    const bodyRef = useRef<HTMLElement>(null);
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [readingMinutes, setReadingMinutes] = useState(0);
    const [copyFailed, setCopyFailed] = useState(false);
    const related = articles.filter(article => article.id !== content.id).slice(0, 3);
    const whatsapp = 'https://wa.me/?text=' + encodeURIComponent(content.title + '\n' + canonical);

    useEffect(() => {
        const root = bodyRef.current;
        if (!root) return;
        const ids = new Set<string>();
        const sections: Heading[] = [];
        root.querySelectorAll<HTMLElement>('h2, h3').forEach((heading, index) => {
            const title = heading.textContent?.trim();
            if (!title) return;
            let id = heading.id;
            if (!id || ids.has(id) || root.ownerDocument.getElementById(id) !== heading) {
                id = 'article-' + content.id + '-section-' + (index + 1);
                while (root.ownerDocument.getElementById(id)) id += '-heading';
                heading.id = id;
            }
            ids.add(id);
            heading.tabIndex = -1;
            sections.push({id, title, level: Number(heading.tagName.slice(1))});
        });
        setReadingMinutes(estimateArticleReadingMinutes(root.textContent));
        setHeadings(sections);
        const fragment = root.ownerDocument.defaultView?.location.hash.slice(1);
        if (fragment) {
            const target = sections.find(section => encodeURIComponent(section.id) === fragment || section.id === fragment);
            if (target) root.ownerDocument.getElementById(target.id)?.scrollIntoView({block: 'start'});
        }
    }, [content.id, content.body]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(canonical);
            setCopyFailed(false);
            showSuccess(t`Link copied`);
        } catch {
            setCopyFailed(true);
            showError(t`Something went wrong`);
        }
    };

    return (
        <div className={classes.articleDetail}>
            <nav className={classes.articleBreadcrumb} aria-label={t`Navigation`}>
                <Link to="/">{t`Home`}</Link><IconChevronRight size={14} aria-hidden="true" /><Link to="/articles">{t`Articles`}</Link>
                <IconChevronRight size={14} aria-hidden="true" /><span aria-current="page">{content.title}</span>
            </nav>
            <header className={classes.articleDetailHeader}>
                <span className={classes.heroBadge}><IconBook size={16} aria-hidden="true" />Barter Up · {t`Articles`}</span>
                <h1>{content.title}</h1>
                {content.summary && <p>{content.summary}</p>}
                <div className={classes.singleMeta}>
                    <PublicationDate value={content.published_at} />
                    {readingMinutes > 0 && <span aria-label={t`Estimated reading time`}><IconClock size={16} aria-hidden="true" />~{readingMinutes} {t`minutes`}</span>}
                    <Group gap="xs" role="group" aria-label={t`Share`}>
                        <Button type="button" variant="light" size="xs" radius="md" leftSection={<IconCopy size={15} aria-hidden="true" />} onClick={copyLink}>{t`Copy link`}</Button>
                        <Button component="a" href={whatsapp} target="_blank" rel="noopener noreferrer" variant="light" color="green" size="xs" radius="md" leftSection={<IconBrandWhatsapp size={16} aria-hidden="true" />}>WhatsApp</Button>
                    </Group>
                </div>
                {copyFailed && <TextInput className={classes.singleCopyFallback} label={t`Copy link`} value={canonical} readOnly onFocus={event => event.currentTarget.select()} />}
            </header>

            {content.cover_image && <img className={classes.articleDetailCover} src={content.cover_image.url} alt="" fetchPriority="high" />}

            <div className={classes.singleLayout}>
                <div className={classes.singleReadingColumn}>
                    {headings.length > 0 && <nav className={classes.singleContents} aria-label={t`Table of contents`}>
                        <h2><IconList size={20} aria-hidden="true" />{t`Table of contents`}</h2>
                        <ol>
                            {headings.map(heading => <li key={heading.id} data-level={heading.level}>
                                <a href={'#' + encodeURIComponent(heading.id)}>{heading.title}</a>
                            </li>)}
                        </ol>
                    </nav>}
                    <article ref={bodyRef} aria-label={content.title}>
                        <UserGeneratedContent className={classes.articleDetailBody} html={content.body} />
                    </article>
                    <div className={classes.articleDetailFooter}>
                        <Button component={Link} to="/articles" variant="light" radius="md">{t`Back`} · {t`Articles`}</Button>
                    </div>
                </div>

                <aside className={classes.singleSidebar}>
                    <section className={classes.singleSidebarCard} aria-label={t`Share`}>
                        <h2><IconShare size={20} aria-hidden="true" />{t`Share`}</h2>
                        <Button type="button" variant="default" fullWidth radius="md" leftSection={<IconCopy size={16} aria-hidden="true" />} onClick={copyLink}>{t`Copy link`}</Button>
                        <Button component="a" href={whatsapp} target="_blank" rel="noopener noreferrer" variant="light" color="green" fullWidth radius="md" leftSection={<IconBrandWhatsapp size={17} aria-hidden="true" />}>WhatsApp</Button>
                    </section>
                    <section className={classes.singleSidebarCta}>
                        <IconBook size={32} stroke={1.4} aria-hidden="true" />
                        <span className={classes.eyebrow}>Barter Up · {t`Community`}</span>
                        <h2>{t`Meet, connect, and grow together.`}</h2>
                        <p>{t`Discover community events and book your tickets directly with Barter Up.`}</p>
                        <Button component={Link} to="/events" variant="white" color="blue" fullWidth radius="md" rightSection={<IconArrowRight size={16} aria-hidden="true" />}>{t`Explore events`}</Button>
                    </section>
                    {related.length > 0 && <nav className={classes.singleSidebarCard} aria-label={t`More articles`}>
                        <h2><IconBook size={20} aria-hidden="true" />{t`More articles`}</h2>
                        {related.map(article => <Link className={classes.singleRelatedLink} to={articlePath(article)} key={article.id}>
                            <span>{article.title}</span><PublicationDate value={article.published_at} />
                        </Link>)}
                    </nav>}
                </aside>
            </div>

            {related.length > 0 && <section className={classes.singleRelated} aria-label={t`More articles`}>
                <div className={classes.sectionHeading}><h2>{t`More articles`}</h2><Link to="/articles">{t`View all`}</Link></div>
                <div className={classes.articleGrid}>
                    {related.map(article => <article className={classes.articleCard} key={article.id}>
                        <Link to={articlePath(article)} tabIndex={-1} aria-hidden="true"><ArticleArtwork article={article} /></Link>
                        <div className={classes.articleCardBody}>
                            <PublicationDate value={article.published_at} />
                            <h3><Link to={articlePath(article)}>{article.title}</Link></h3>
                            {article.summary && <p>{article.summary}</p>}
                            <Link className={classes.articleReadMore} to={articlePath(article)} aria-label={t`Read more` + ': ' + article.title}>{t`Read more`}<IconArrowRight size={17} aria-hidden="true" /></Link>
                        </div>
                    </article>)}
                </div>
            </section>}
        </div>
    );
};
