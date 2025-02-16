import React from 'react';
import { getFirebaseUser, signInWithGoogle, getFirebaseDataAsync } from '../util/firebase';
import { goBack, pushSubscreen } from '../util/navigate';
import { LoadingScreen, Narrow, Pad, PadBox } from '../component/basics';
import { Image } from 'react-native';
import { useDatastore } from '../util/datastore';
import { Heading } from '../component/text';
import { RichText } from '../component/richtext';
import { colorTextGrey } from '../component/color';
import { CTAButton } from '../component/button';
import { makeAssetUrl } from '../util/util';
import { logEventAsync, useLogEvent } from '../util/eventlog';
import { FirstLoginSetup } from '../feature/ProfilePhotoAndName';


export function LoginScreen({ action }) {
    useLogEvent('login-screen', { action });
    const datastore = useDatastore();
    const [inProgress, setInProgress] = React.useState(false);
    const [needsSetup, setNeedsSetup] = React.useState(false);
    async function handleGoogleSignIn() {
        logEventAsync(datastore, 'login-request', { method: 'google' });
        try {
            const result = await signInWithGoogle();
            logEventAsync(datastore, 'login-success', {
                method: 'google',
                email: result?.user?.email ?? 'unknown',
            });
            setInProgress(true);
            const userId = result.user.uid;
            const personaPreview = await getFirebaseDataAsync([
                'silo', datastore.getSiloKey(), 'structure', 'profile',
                'instance', userId, 'global', 'preview']);
            if (!personaPreview?.name) {
                setInProgress(false);
                setNeedsSetup(true);
            } else {
                goBack();
            }
        } catch (error) {
            console.error(error);
        }
    };

    async function onFieldsChosen({updates, preview}) {
        setInProgress(true);
        await datastore.callServerAsync('profile', 'update', {
            updates, preview,
            structureKey: 'profile',
            instanceKey: datastore.getPersonaKey(),
        });
        setInProgress(false);
        logEventAsync(datastore, 'profile-setup', preview);
        goBack();
    }

    if (inProgress) {
        return <LoadingScreen label='Logging in...' />
    } else if (needsSetup) {
        return <Narrow><Pad size={20}/><FirstLoginSetup onFieldsChosen={onFieldsChosen} /></Narrow>
    } else {
        return (
            <PadBox horiz={20} vert={20}>
                <Heading level='1' label={'Log in' + (action ? ' to ' + action : '')} />
                <Pad />
                <RichText color={colorTextGrey} label='By continuing, you agree to our [community guidelines](https://example.com) and [Privacy Policy](https://example.com).' />
                <Pad size={40} />
                <CTAButton
                    icon={
                        <Image source={{ uri: makeAssetUrl('images/google.png') }}
                            style={{ width: 20, height: 20 }} />
                    }
                    type='secondary' label='Continue with Google' onPress={handleGoogleSignIn} />
            </PadBox>
        );
    }
};

export function needsLogin(callback, action) {
    return () => {
        const user = getFirebaseUser();

        if (!user) {
            pushSubscreen('login', { action });
        } else {
            return callback();
        }
    }
}
