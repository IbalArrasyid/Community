import {Button, NativeSelect, Pagination, TextInput} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconArrowRight, IconBook, IconChevronRight, IconSearch} from '@tabler/icons-react';
import {Form, Link, useNavigate, useNavigation, useSearchParams} from 'react-router';
import {CommunityContent} from '../../../api/community.client';
import {GenericPaginatedResponse} from '../../../types';
import {UserGeneratedContent} from '../../common/UserGeneratedContent';
import {ArticleArtwork, articlePath, PublicationDate} from './articlePresentation';
import classes from './Community.module.scss';

export const ArticlesPage = ({articles, content}: {
    articles: GenericPaginatedResponse<CommunityContent> | null;
    content: CommunityContent | null;
}) => {
    const [search] = useSearchParams();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isPending = navigation.state !== 'idle' && navigation.location?.pathname === '/articles';
    const query = (search.get('q') ?? '').trim().slice(0, 200);
    const sort = search.get('sort') === 'oldest' ? 'oldest' : 'newest';
    const items = articles?.data ?? [];
    const featured = !query.trim() && sort === 'newest' && articles?.meta.current_page === 1 ? items[0] : undefined;
    const cards = featured ? items.slice(1) : items;
    const changePage = (page: number) => {
        const next = new URLSearchParams(search);
        next.set('page', String(page));
        navigate('/articles?' + next.toString());
    };

    return (
        <div className={classes.articlesPage}>
            <nav className={classes.articleBreadcrumb} aria-label={t`Navigation`}>
                <Link to="/">{t`Home`}</Link><IconChevronRight size={14} aria-hidden="true" /><span aria-current="page">{t`Articles`}</span>
            </nav>
            <section className={classes.articlesHero}>
                <span className={classes.heroBadge}><IconBook size={16} aria-hidden="true" />Barter Up · {t`Articles`}</span>
                <h1>{content?.title || t`Articles & guides`}</h1>
                <p>{content?.summary || t`Stories and practical ideas for your next community event.`}</p>
                <Form method="get" action="/articles" className={classes.articleSearch} key={query + ':' + sort} aria-label={t`Search`}>
                    <TextInput name="q" label={t`Search`} defaultValue={query} maxLength={200} leftSection={<IconSearch size={18} aria-hidden="true" />} />
                    <NativeSelect name="sort" label={t`Published`} defaultValue={sort} data={[
                        {value: 'newest', label: t`Newest first`},
                        {value: 'oldest', label: t`Oldest first`},
                    ]} />
                    <Button type="submit" radius="md" loading={isPending} rightSection={<IconArrowRight size={16} aria-hidden="true" />}>{t`Search`}</Button>
                    {(query || sort !== 'newest') && <Link to="/articles">{t`Reset`}</Link>}
                </Form>
            </section>

            {featured && <section className={classes.articleFeatured} aria-label={featured.title}>
                <Link to={articlePath(featured)} tabIndex={-1} aria-hidden="true"><ArticleArtwork article={featured} priority /></Link>
                <div className={classes.articleFeaturedBody}>
                    <span className={classes.eyebrow}>Barter Up · {t`Articles`}</span>
                    <PublicationDate value={featured.published_at} />
                    <h2><Link to={articlePath(featured)}>{featured.title}</Link></h2>
                    {featured.summary && <p>{featured.summary}</p>}
                    <Button component={Link} to={articlePath(featured)} radius="md" rightSection={<IconArrowRight size={17} aria-hidden="true" />}>{t`Read more`}</Button>
                </div>
            </section>}

            <section className={classes.articleResults} aria-label={t`Articles`} aria-busy={isPending}>
                <div className={classes.sectionHeading}>
                    <h2>{t`Articles`}</h2>
                    {articles && <span className={classes.articleCount}>{articles.meta.total}</span>}
                </div>
                {cards.length > 0 && <div className={classes.articleGrid}>
                    {cards.map(article => <article className={classes.articleCard} key={article.id}>
                        <Link to={articlePath(article)} tabIndex={-1} aria-hidden="true"><ArticleArtwork article={article} /></Link>
                        <div className={classes.articleCardBody}>
                            <PublicationDate value={article.published_at} />
                            <h3><Link to={articlePath(article)}>{article.title}</Link></h3>
                            {article.summary && <p>{article.summary}</p>}
                            <Link className={classes.articleReadMore} to={articlePath(article)} aria-label={t`Read more` + ': ' + article.title}>{t`Read more`}<IconArrowRight size={17} aria-hidden="true" /></Link>
                        </div>
                    </article>)}
                </div>}
                {items.length === 0 && <div className={classes.articleEmpty} role="status">
                    <IconBook size={44} stroke={1.2} aria-hidden="true" />
                    <p>{query ? t`No articles found.` : t`No articles published yet.`}</p>
                    {query && <Button component={Link} to="/articles" variant="light">{t`Reset`}</Button>}
                </div>}
                {articles && articles.meta.last_page > 1 && <Pagination total={articles.meta.last_page} value={articles.meta.current_page} onChange={changePage} className={classes.articlePagination} />}
            </section>

            {content?.body && <UserGeneratedContent className={classes.aboutRichText} html={content.body} />}
            <section className={classes.callout}>
                <span className={classes.eyebrow}>Barter Up · {t`Community`}</span>
                <h2>{t`Meet, connect, and grow together.`}</h2>
                <Button component={Link} to="/events" size="lg" radius="md" rightSection={<IconArrowRight size={18} aria-hidden="true" />}>{t`Explore events`}</Button>
            </section>
        </div>
    );
};

