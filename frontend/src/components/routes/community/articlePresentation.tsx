import {IconBook, IconCalendar} from '@tabler/icons-react';
import {CommunityContent} from '../../../api/community.client';
import classes from './Community.module.scss';

export const articlePath = (article: CommunityContent) => '/articles/' + encodeURIComponent(article.slug);

export const PublicationDate = ({value}: {value: string | null}) => {
    if (!value || Number.isNaN(Date.parse(value))) return null;
    return <time dateTime={value}><IconCalendar size={15} aria-hidden="true" />{new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(value))}</time>;
};

export const ArticleArtwork = ({article, priority = false}: {article: CommunityContent; priority?: boolean}) => (
    <div className={classes.articleArtwork}>
        {article.cover_image ? <img src={article.cover_image.url} alt="" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />
            : <IconBook size={64} stroke={1} aria-hidden="true" />}
    </div>
);
