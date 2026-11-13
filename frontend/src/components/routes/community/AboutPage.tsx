import {Button, Group} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconArrowRight, IconCalendarEvent, IconQrcode, IconTicket, IconUsers} from '@tabler/icons-react';
import {Link} from 'react-router';
import {CommunityContent} from '../../../api/community.client';
import {Organizer} from '../../../types';
import {UserGeneratedContent} from '../../common/UserGeneratedContent';
import classes from './Community.module.scss';

type AboutPageProps = {
    content: CommunityContent | null;
    organizer: Organizer;
    title: string;
    heroImage?: string;
};

export const AboutPage = ({content, organizer, title, heroImage}: AboutPageProps) => {
    const capabilities = [
        {Icon: IconUsers, label: t`Community`},
        {Icon: IconCalendarEvent, label: t`Events`},
        {Icon: IconTicket, label: t`Tickets`},
        {Icon: IconQrcode, label: t`Check-in`},
    ];
    const body = content?.body || organizer.description;

    return (
        <div className={classes.about}>
            <section className={classes.aboutHero}>
                <span className={classes.heroBadge}><span />{t`About`} · Barter Up</span>
                <h1>{title}</h1>
                <p>{content?.summary || t`Discover community events and book your tickets directly with Barter Up.`}</p>
                <div className={classes.aboutCapabilities}>
                    {capabilities.map(({Icon, label}) => (
                        <div className={classes.aboutCapability} key={label}>
                            <Icon size={28} stroke={1.6} aria-hidden="true" />
                            <strong>{label}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <section className={classes.aboutBanner} aria-label={t`Community`}>
                <div className={classes.aboutArtwork}>
                    {heroImage ? <img src={heroImage} alt="" fetchPriority="high" /> : (
                        <div className={classes.aboutIllustration} aria-hidden="true">
                            <span><IconUsers size={80} stroke={1} /></span>
                            <span><IconCalendarEvent size={48} stroke={1.3} /></span>
                            <span><IconTicket size={48} stroke={1.3} /></span>
                        </div>
                    )}
                    <div className={classes.aboutArtworkCaption}>
                        <span className={classes.eyebrow}>Barter Up</span>
                        <h2>{t`Meet, connect, and grow together.`}</h2>
                    </div>
                </div>
                <aside className={classes.aboutStatement}>
                    <IconUsers size={40} stroke={1.3} aria-hidden="true" />
                    <h2>{t`Community`}</h2>
                    <p>{t`Discover community events and book your tickets directly with Barter Up.`}</p>
                    <Link to="/events">{t`Explore events`}<IconArrowRight size={18} aria-hidden="true" /></Link>
                </aside>
            </section>

            {body && <div className={classes.aboutEditorial}>
                <UserGeneratedContent html={body} className={classes.aboutRichText} />
            </div>}

            <section className={classes.aboutCta} aria-label={t`Contact`}>
                <span className={classes.eyebrow}>Barter Up · {t`Community`}</span>
                <h2>{t`Meet, connect, and grow together.`}</h2>
                <p>{t`Discover community events and book your tickets directly with Barter Up.`}</p>
                <Group gap="md">
                    <Button component={Link} to="/events" variant="white" color="blue" size="lg" radius="md" rightSection={<IconArrowRight size={18} />}>
                        {t`Explore events`}
                    </Button>
                    <Button component={Link} to="/contact" variant="white" color="dark" size="lg" radius="md">
                        {t`Contact`}
                    </Button>
                </Group>
            </section>
        </div>
    );
};
