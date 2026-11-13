import {useState} from "react";
import {Link, useParams} from "react-router";
import {Alert, Badge, Button, FileInput, Group, Pagination, Select, Stack, Tabs, Text, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {t} from "@lingui/macro";
import {CommunityContent, CommunityContentInput} from "../../../../api/community.client";
import {useCommunityContents, useCommunityInbox} from "../../../../queries/useCommunity";
import {useReadCommunityContact, useSaveCommunityContent} from "../../../../mutations/useCommunityMutations";
import {useUploadImage} from "../../../../mutations/useUploadImage";
import {useAccess} from "../../../../hooks/useAccess";
import {useFormErrorResponseHandler} from "../../../../hooks/useFormErrorResponseHandler";
import {showError, showSuccess} from "../../../../utilites/notifications";
import {CreateButton} from "../../../common/CreateButton";
import {RequirePermission, WriteAccess} from "../../../common/WriteAccess";
import {Modal, ModalFooter} from "../../../common/Modal";
import {Editor} from "../../../common/Editor";
import {SettingsPage, SettingsSection} from "../../../common/SettingsPage";
import classes from "./CommunityContent.module.scss";

const localDateTime = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const ContentEditor = ({organizerId, content, onClose}: {
    organizerId: string;
    content?: CommunityContent;
    onClose: () => void;
}) => {
    const form = useForm({
        initialValues: {
            type: content?.type ?? 'PAGE' as CommunityContentInput['type'],
            title: content?.title ?? '',
            slug: content?.slug ?? '',
            summary: content?.summary ?? '',
            body: content?.body ?? '',
            cover_image_id: content?.cover_image ? content.cover_image_id ?? null : null as number | null,
            status: content?.status ?? 'DRAFT' as CommunityContentInput['status'],
            published_at: localDateTime(content?.published_at),
            seo_title: content?.seo_title ?? '',
            seo_description: content?.seo_description ?? '',
        },
        validate: {
            title: value => value.trim() ? null : t`Required`,
            slug: value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? null : t`Use lowercase letters, numbers and hyphens.`,
            body: value => value.trim() ? null : t`Required`,
        },
    });
    const save = useSaveCommunityContent(organizerId);
    const upload = useUploadImage();
    const handleError = useFormErrorResponseHandler();
    const [preview, setPreview] = useState(false);
    const [cover, setCover] = useState(content?.cover_image?.url);
    const busy = save.isPending || upload.isPending;

    const uploadCover = (file: File | null) => {
        if (!file) return;
        upload.mutate({image: file, imageType: 'ORGANIZER_GALLERY', entityId: organizerId}, {
            onSuccess: response => {
                form.setFieldValue('cover_image_id', Number(response.data.id));
                setCover(response.data.url);
            },
            onError: error => handleError(form, error),
        });
    };

    return (
        <Modal opened onClose={onClose} heading={content ? t`Edit content` : t`Create content`}>
            <form onSubmit={form.onSubmit(values => {
                const data: CommunityContentInput = {
                    ...values,
                    published_at: values.published_at ? new Date(values.published_at).toISOString().replace(/\.\d{3}Z$/, '+00:00') : null,
                };
                save.mutate({id: content?.id, data}, {
                    onSuccess: () => {
                        showSuccess(t`Content saved`);
                        onClose();
                    },
                    onError: error => handleError(form, error),
                });
            })}>
                <fieldset disabled={busy} className={classes.fields}>
                    <Select label={t`Type`} allowDeselect={false} data={[{value: 'PAGE', label: t`Page`}, {value: 'ARTICLE', label: t`Article`}]} {...form.getInputProps('type')} />
                    <TextInput label={t`Title`} required maxLength={200} {...form.getInputProps('title')} />
                    <TextInput label={t`Slug`} description={t`Use home, about or contact for the main pages.`} required maxLength={160} {...form.getInputProps('slug')} />
                    <Textarea label={t`Summary`} maxLength={1000} {...form.getInputProps('summary')} />
                    <Editor label={t`Content`} required maxLength={100000} value={form.values.body} onChange={value => form.setFieldValue('body', value)} error={form.errors.body} />
                    <FileInput label={t`Cover image`} accept="image/jpeg,image/png,image/webp" onChange={uploadCover} error={form.errors.cover_image_id} />
                    {cover && <Group>
                        <img className={classes.cover} src={cover} alt="" />
                        <Button variant="subtle" onClick={() => {form.setFieldValue('cover_image_id', null); setCover(undefined);}}>{t`Remove`}</Button>
                    </Group>}
                    <Select label={t`Status`} allowDeselect={false} data={[{value: 'DRAFT', label: t`Draft`}, {value: 'PUBLISHED', label: t`Published`}]} {...form.getInputProps('status')} />
                    {form.values.status === 'PUBLISHED' && <TextInput label={t`Publish at (local time)`} type="datetime-local" {...form.getInputProps('published_at')} />}
                    <TextInput label={t`SEO Title`} maxLength={200} {...form.getInputProps('seo_title')} />
                    <Textarea label={t`SEO Description`} maxLength={320} {...form.getInputProps('seo_description')} />
                </fieldset>
                {preview && <iframe title={t`Preview`} sandbox="" srcDoc={form.values.body} className={classes.preview} />}
                <ModalFooter start={<Button variant="subtle" onClick={() => setPreview(!preview)}>{t`Preview`}</Button>}>
                    <Button variant="default" onClick={onClose}>{t`Cancel`}</Button>
                    <Button type="submit" loading={save.isPending} disabled={upload.isPending}>{t`Save`}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

const CommunityContentPage = () => {
    const {organizerId = ''} = useParams();
    const {can, isLoaded} = useAccess();
    const [page, setPage] = useState(1);
    const [inboxPage, setInboxPage] = useState(1);
    const [editing, setEditing] = useState<CommunityContent | null | undefined>();
    const enabled = isLoaded && can('MANAGE_CONTENT');
    const contents = useCommunityContents(organizerId, page, enabled);
    const inbox = useCommunityInbox(organizerId, inboxPage, enabled);
    const read = useReadCommunityContact(organizerId);

    return (
        <RequirePermission permission="MANAGE_CONTENT">
            <SettingsPage title={t`Website content`} width="wide" description={t`Pages, articles and contact submissions.`}
                actions={<CreateButton onClick={() => setEditing(null)}>{t`Create content`}</CreateButton>}>
                <Text mb="lg"><Link to="/" target="_blank" rel="noopener noreferrer">{t`View website`}</Link></Text>
                <Tabs defaultValue="content">
                    <Tabs.List>
                        <Tabs.Tab value="content">{t`Content`}</Tabs.Tab>
                        <Tabs.Tab value="inbox">{t`Inbox`}</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="content" pt="lg">
                        {contents.isPending && <Text role="status">{t`Loading...`}</Text>}
                        {contents.isError && <Alert color="red">{t`Something went wrong. Please try again.`}</Alert>}
                        {contents.data?.data.length === 0 && <Text>{t`No content yet.`}</Text>}
                        <Stack>
                            {contents.data?.data.map(item => (
                                <SettingsSection key={item.id} title={item.title}>
                                    <Group justify="space-between">
                                        <div><Badge color={item.status === 'PUBLISHED' ? 'teal' : 'gray'}>{item.status === 'PUBLISHED' ? t`Published` : t`Draft`}</Badge>
                                            <Text size="sm">{item.type === 'PAGE' ? t`Page` : t`Article`} · {item.slug}</Text>
                                            {item.published_at && <Text size="sm">{new Date(item.published_at).toLocaleString()}</Text>}
                                        </div>
                                        <WriteAccess><Button variant="light" onClick={() => setEditing(item)}>{t`Edit`}</Button></WriteAccess>
                                    </Group>
                                </SettingsSection>
                            ))}
                            {contents.data && contents.data.meta.last_page > 1 && <Pagination total={contents.data.meta.last_page} value={page} onChange={setPage} />}
                        </Stack>
                    </Tabs.Panel>
                    <Tabs.Panel value="inbox" pt="lg">
                        {inbox.isPending && <Text role="status">{t`Loading...`}</Text>}
                        {inbox.isError && <Alert color="red">{t`Something went wrong. Please try again.`}</Alert>}
                        {inbox.data?.data.length === 0 && <Text>{t`No messages yet.`}</Text>}
                        <Stack>
                            {inbox.data?.data.map(item => (
                                <SettingsSection key={item.id} title={item.subject}>
                                    <Text fw={600}>{item.name}</Text>
                                    <Text size="sm">{item.email}</Text>
                                    <Text size="sm" c="dimmed">{new Date(item.created_at).toLocaleString()}</Text>
                                    <Text className={classes.message} my="md">{item.message}</Text>
                                    {!item.read_at && <WriteAccess><Button variant="light" loading={read.isPending} onClick={() => read.mutate(item.id, {
                                        onError: () => showError(t`Something went wrong. Please try again.`),
                                    })}>{t`Mark as read`}</Button></WriteAccess>}
                                </SettingsSection>
                            ))}
                            {inbox.data && inbox.data.meta.last_page > 1 && <Pagination total={inbox.data.meta.last_page} value={inboxPage} onChange={setInboxPage} />}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
                {editing !== undefined && <WriteAccess><ContentEditor organizerId={organizerId} content={editing ?? undefined} onClose={() => setEditing(undefined)} /></WriteAccess>}
            </SettingsPage>
        </RequirePermission>
    );
};

export default CommunityContentPage;
