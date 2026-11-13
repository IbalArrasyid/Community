import {Button} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconArrowRight, IconBook, IconChevronRight, IconMessageCircle, IconSend} from '@tabler/icons-react';
import {Link} from 'react-router';
import {CommunityContent} from '../../../api/community.client';
import {openSupportWidget} from '../../../utilites/supportChat';
import {CommunityContactForm} from '../../common/CommunityContactForm';
import {UserGeneratedContent} from '../../common/UserGeneratedContent';
import classes from './Community.module.scss';

export const ContactPage = ({content}: {content: CommunityContent | null}) => (
    <div className={classes.contactPage}>
        <nav className={classes.articleBreadcrumb} aria-label={t`Navigation`}>
            <Link to="/">{t`Home`}</Link><IconChevronRight size={14} aria-hidden="true" /><span aria-current="page">{t`Contact`}</span>
        </nav>
        <header className={classes.contactHero}>
            <span className={classes.heroBadge}><IconMessageCircle size={16} aria-hidden="true" />Barter Up · {t`Contact`}</span>
            <h1>{content?.title || t`How can we help?`}</h1>
            <p>{content?.summary || t`Ask us about events, tickets, or partnerships.`}</p>
        </header>

        <div className={classes.contactChannels}>
            <section>
                <span className={classes.contactChannelIcon}><IconSend size={26} aria-hidden="true" /></span>
                <h2>{t`Send Message`}</h2>
                <p>{t`Ask us about events, tickets, or partnerships.`}</p>
                <Button component="a" href="#community-contact-form" radius="md" rightSection={<IconArrowRight size={17} aria-hidden="true" />}>{t`Send Message`}</Button>
            </section>
            <section>
                <span className={classes.contactChannelIcon}><IconBook size={26} aria-hidden="true" /></span>
                <h2>{t`Articles & guides`}</h2>
                <p>{t`Stories and practical ideas for your next community event.`}</p>
                <Button component={Link} to="/articles" radius="md" variant="light" rightSection={<IconArrowRight size={17} aria-hidden="true" />}>{t`Articles`}</Button>
            </section>
            <section>
                <span className={classes.contactChannelIcon}><IconMessageCircle size={26} aria-hidden="true" /></span>
                <h2>{t`Community`}</h2>
                <p>{t`Meet, connect, and grow together.`}</p>
                <Button type="button" onClick={openSupportWidget} radius="md" variant="light" rightSection={<IconArrowRight size={17} aria-hidden="true" />}>{t`Contact`}</Button>
            </section>
        </div>

        <div className={classes.contactLayout}>
            <section className={classes.contactFormCard} id="community-contact-form" tabIndex={-1}>
                <span className={classes.eyebrow}>Barter Up · {t`Contact`}</span>
                <h2>{t`Send Message`}</h2>
                <p>{t`Ask us about events, tickets, or partnerships.`}</p>
                <CommunityContactForm />
            </section>
            <aside className={classes.contactInformation}>
                {content?.cover_image && <img src={content.cover_image.url} alt="" loading="lazy" />}
                {content?.body ? <UserGeneratedContent className={classes.aboutRichText} html={content.body} /> : <>
                    <IconMessageCircle size={36} stroke={1.4} aria-hidden="true" />
                    <h2>{t`How can we help?`}</h2>
                    <p>{t`Ask us about events, tickets, or partnerships.`}</p>
                </>}
            </aside>
        </div>
        <section className={classes.callout}>
            <h2>{t`Meet, connect, and grow together.`}</h2>
            <Button component={Link} to="/events" size="lg" radius="md" rightSection={<IconArrowRight size={18} aria-hidden="true" />}>{t`Explore events`}</Button>
        </section>
    </div>
);
