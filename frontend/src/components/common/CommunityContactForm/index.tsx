import {useState} from 'react';
import {Alert, Button, Group, Textarea, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {t} from '@lingui/macro';
import {IconCheck, IconSend} from '@tabler/icons-react';
import {useSendCommunityContact} from '../../../mutations/useCommunityMutations';
import {useFormErrorResponseHandler} from '../../../hooks/useFormErrorResponseHandler';
import {ModalFooter} from '../Modal';
import classes from './CommunityContactForm.module.scss';

export const CommunityContactForm = ({onCancel}: {onCancel?: () => void}) => {
    const [received, setReceived] = useState(false);
    const [failed, setFailed] = useState(false);
    const form = useForm({
        initialValues: {name: '', email: '', subject: '', message: '', website: ''},
        validate: {
            name: value => value.trim() ? null : t`Required`,
            email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : t`Please enter a valid email address`,
            subject: value => value.trim() ? null : t`Required`,
            message: value => value.trim().length >= 10 ? null : t`Please enter at least 10 characters.`,
        },
    });
    const mutation = useSendCommunityContact();
    const handleError = useFormErrorResponseHandler();
    const submit = (values: typeof form.values) => {
        setReceived(false);
        setFailed(false);
        mutation.mutate(values, {
            onSuccess: receipt => {
                if (receipt?.data?.received !== true) {
                    setFailed(true);
                    return;
                }
                form.reset();
                setReceived(true);
            },
            onError: error => {
                setFailed(true);
                handleError(form, error);
            },
        });
    };
    const submitButton = <Button type="submit" radius="md" loading={mutation.isPending} leftSection={<IconSend size={17} aria-hidden="true" />}>{t`Send Message`}</Button>;

    return <form className={classes.form} aria-label={t`Contact`} onSubmit={form.onSubmit(submit)}>
        {received && <Alert color="green" icon={<IconCheck size={18} aria-hidden="true" />} role="status">{t`Your message has been received.`}</Alert>}
        {failed && <Alert color="red" role="alert">{t`There was an error processing your request. Please try again.`}</Alert>}
        <fieldset disabled={mutation.isPending}>
            <div className={classes.identity}>
                <TextInput label={t`Name`} autoComplete="name" maxLength={100} required {...form.getInputProps('name')} />
                <TextInput label={t`Email`} type="email" autoComplete="email" maxLength={254} required {...form.getInputProps('email')} />
            </div>
            <TextInput label={t`Subject`} maxLength={200} required {...form.getInputProps('subject')} />
            <Textarea label={t`Message`} minRows={6} maxLength={5000} required {...form.getInputProps('message')} />
            <div className={classes.honeypot} aria-hidden="true">
                <TextInput label={t`Website`} tabIndex={-1} autoComplete="off" {...form.getInputProps('website')} />
            </div>
            {onCancel ? <ModalFooter>
                <Button type="button" variant="default" onClick={onCancel}>{t`Cancel`}</Button>
                {submitButton}
            </ModalFooter> : <Group>{submitButton}</Group>}
        </fieldset>
    </form>;
};
