import { getDeviceInfo } from "../platform-specific/deviceinfo";
import { useDatastore } from "./datastore";
import { firebaseNewKey, getFirebaseUser, onFbUserChanged } from "./firebase";
import { callServerApiAsync } from "./servercall";
import { useEffect, useState } from "react";

const hourMillis = 60*60*1000;

export var eventTypes = {
    'error': 'An error occurred',
    'login-screen': 'Open the Login Screen',
    'login-request': 'Request to login',
    'login-success': 'Successful login',
    'showReplies': 'Show replies to a post',
    'post-start': 'Open the Composer Screen to write a new top level response',
    'post-cancel': 'Cancel writing a post',
    'post-finish': 'Finish writing a post',
    'edit-start-top': 'Start editing a post',
    'edit-start-reply': 'Start editing a reply',
    'edit-cancel': 'Cancel editing a post',
    'edit-finish': 'Finish editing a post',
    'profile-edit': 'Edit your profile',
    'profile-setup': 'Set up your profile on first login',
    'reply-start': 'Start a reply to a post',
    'reply-finish': 'Finish a reply to a post',
    'upvote': 'Upvote a post',
    'upvote-undo': 'Unvote a post',
}

export function addEventTypes(newEventTypes) {
    eventTypes = {...eventTypes, ...newEventTypes};
}

onFbUserChanged((userId) => {
    if (userId) {
        console.log('User changed', userId.uid);
        setSessionUserAsync(userId.uid);
    }
});

window.addEventListener('error', event => {
    if (global_in_error_handler) {
        return; // avoid infinite error loop if this fails
    }
    global_in_error_handler = true;
    const error = event.error;
    console.log('Caught an error', {error});
    logEventAsync(null, 'error', {message: error.message, stack: error.stack});
    global_in_error_handler = true;
})

window.addEventListener('unhandledrejection', async event => {
    if (global_in_error_handler) {
        return; // avoid infinite error loop if this fails
    }
    global_in_error_handler = true;
    const error = event.reason;
    console.log('Caught an unhandled promise rejection', {error});
    await logEventAsync(null, 'error', {message: error.message, stack: error.stack});
    global_in_error_handler = false;
})

var global_last_event = null;
var global_in_error_handler = false;

export async function setSessionUserAsync(userId) {
    const sessionKey = localStorage.getItem('sessionKey');
    if (sessionKey && userId) {
        await callServerApiAsync({component: 'eventlog', funcname: 'setSessionUser', params: {
            sessionKey, userId, eventKey: global_last_event
        }});
    }
}

export async function logEventAsync(datastore, eventType, params) {
    var sessionKey = localStorage.getItem('sessionKey');
    var sessionTime = localStorage.getItem('sessionTime');
    var isNewSession = false;
    var deviceInfo = null;
    const preFirebaseUser = getFirebaseUser();
    
    if (!sessionKey || !sessionTime || Date.now() - sessionTime > hourMillis){
        sessionKey = firebaseNewKey();
        sessionTime = Date.now();
        isNewSession = true;
        localStorage.setItem('sessionKey', sessionKey);
        localStorage.setItem('sessionTime', sessionTime);    
        deviceInfo = getDeviceInfo();
        console.log('New session', sessionKey, deviceInfo);
    }

    // IMPORTANT: We can't use datastore.callServerAsync here because datastore will
    // be null if we are called from an unhandled promise rejection
    await callServerApiAsync({component: 'eventlog', funcname: 'logEvent', params: {
        eventType, sessionKey, isNewSession, params, deviceInfo
    }});
    global_last_event = result?.eventKey ?? null;

    const postFirebaseUser = getFirebaseUser();

    if (postFirebaseUser && !preFirebaseUser) {
        setSessionUserAsync(postFirebaseUser.uid);
        return;
    }

}

export async function useLogEvent(eventKey, params, skip=false) {
    const datastore = useDatastore();
    useEffect(() => {
        if (!skip) {
            logEventAsync(datastore, eventKey, params);
        }
    }, [eventKey, JSON.stringify(params), skip]);
}

export async function getLogEventsAsync({datastore, siloKey, eventType, sessionKey} = {}) {
    const eventObjs = await datastore.callServerAsync('eventlog', 'getEvents', {
        filterSiloKey:siloKey, eventType, sessionKey
    });
    const eventKeys = Object.keys(eventObjs || {}).sort((a, b) => eventObjs[b].time - eventObjs[a].time);
    return eventKeys.map(key => ({key, ...eventObjs[key]}));
}

function getSessionTime(session) {
    return session.endTime ?? session.startTime ?? 0;
}

export async function getSessionsAsync({datastore, siloKey = null} = {}) {
    const sessionObjs = await datastore.callServerAsync('eventlog', 'getSessions', {filterSiloKey: siloKey});
    const sessionKeys = Object.keys(sessionObjs).sort((a, b) => getSessionTime(sessionObjs[b]) - getSessionTime(sessionObjs[a]));
    return sessionKeys.map(key => ({key, ...sessionObjs[key]}));
}

export function useSession({sessionKey}) {
    const [session, setSession] = useState(null);
    const datastore = useDatastore();

    useEffect(() => {
        datastore.callServerAsync('eventlog', 'getSingleSession', {sessionKey            
        }).then(session => setSession(session));
    }, [sessionKey]);
    return session;
}