import { useIsAdmin } from "../component/admin";
import { ConversationScreen, HorizBox, HoverSelectBox, HoverView, Pad, PadBox, Separator, WindowTitle } from "../component/basics";
import { CTAButton, TextButton } from "../component/button";
import { formatDate } from "../component/date";
import { Byline } from "../component/people";
import { RichText } from "../component/richtext";
import { Heading, Paragraph, UtilityText } from "../component/text";
import { useDatastore, useSessionData } from "../util/datastore";
import { eventTypes, getLogEventsAsync, getSessionsAsync, useSession } from "../util/eventlog";
import { useState, useEffect } from "react";
import { View } from 'react-native';
import { gotoInstance } from "../util/navigate";
import { colorBlueBackground, colorTextGrey } from "../component/color";
import { useLanguage } from "../component/translation";
import { Banner } from "../component/banner";

// TODO: Make this code less hideous. Written in haste before going on vacation.


export const EventLogStructure = {
    key: 'eventlog',
    name: 'Event Log',
    screen: HomeScreen,
    subscreens: {
        eventlog: EventLogScreen,
        sessions: SessionListScreen,
        events: EventTypesScreen,
    }
}

function HomeScreen() {
    const datastore = useDatastore();
    return <ConversationScreen>
        <WindowTitle title='Log Dashboard' />
        <Pad />
        <Heading level={1} label='Logs Dashboard' />
        <Pad />
        <CTAButton label='Sessions' onPress={() => datastore.pushSubscreen('sessions')}/>
        <Pad />
        <CTAButton label='Event Types' onPress={() => datastore.pushSubscreen('events')} />
    </ConversationScreen>
}

export function EventTypesScreen() {
    return <ConversationScreen>
        <WindowTitle title='Event Types' />
        <Pad />
        <Heading level={1} label='Event Types' />
        <Pad />
        {Object.keys(eventTypes).map((eventType, i) => <PadBox vert={4} key={i}><EventType eventType={eventType} /></PadBox>)}
    </ConversationScreen>
}

function EventType({eventType}) {
    const datastore = useDatastore();
    const [hover, setHover] = useState(false);
    return <HoverView setHover={setHover} onPress={() => datastore.pushSubscreen('eventlog', {eventType})}>
        <UtilityText strong label={eventType} underline={hover} />
        <UtilityText color={colorTextGrey} label={eventTypes[eventType]} />
    </HoverView>
}

export function SessionListScreen() {
    const [sessions, setSessions] = useState([]);
    const [limit, setLimit] = useState(20);
    const datastore = useDatastore();

    async function onRefresh() {
        const sessions = await getSessionsAsync({datastore});
        setSessions(sessions);
    }

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') return; // Auto-load doesn't work in tests
        onRefresh();
    }, []);

    const shownSessions = sessions.slice(0, limit);

    return <ConversationScreen>
        <WindowTitle title='Sessions' />
        <Pad />
        <HorizBox spread center>
            <Heading level={1} label='Sessions' />
            <CTAButton label='Refresh' onPress={onRefresh} />
        </HorizBox>
        <Pad />
        {shownSessions.map((session, i) => <PadBox vert={4} key={i}><SessionPreview session={session} /></PadBox>)}
        {sessions.length > limit && <PadBox top={20}><CTAButton label='Load more' onPress={() => setLimit(limit * 2)} /></PadBox>}
    </ConversationScreen>
}

export function SessionPreview({session}) {
    const language = useLanguage();
    const datastore = useDatastore();
    return <HoverView onPress={() => datastore.pushSubscreen('eventlog', {sessionKey: session.key})}>
        <Byline type='large' userId={session.userId} name={session.userName} photo={session.userPhoto} 
            clickable={false} time={session.endTime ?? session.startTime} 
            subtitleLabel={session.deviceInfo && '{time} - {mobileDesktop} - {browserName} - {browserVersion} - {os} - {screenWidth}x{screenHeight}'}
            subtitleParams={{...session?.deviceInfo, 
                time: formatDate(session.endTime ?? session.startTime, language),
                mobileDesktop: session?.deviceInfo?.isMobile ? 'Mobile' : 'Desktop'
            }}
        />
    </HoverView>
}


export function EventLogScreen({eventType, sessionKey, siloKey}) {
    const isAdmin = useIsAdmin();
    const [events, setEvents] = useState(null); 
    const [limit, setLimit] = useState(20);
    const datastore = useDatastore();

    async function onRefresh() {
        const events = await getLogEventsAsync({datastore, sessionKey, siloKey, eventType});
        setEvents(events);
    }

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') return; // Auto-load doesn't work in tests
        onRefresh();
    }, []);

    if (!events) {
        return <PadBox horiz={20} vert={20}><Banner color={colorBlueBackground}><UtilityText label='Loading Events...' /></Banner></PadBox>
    }

    const sortedEvents = events.sort((a, b) => b.time - a.time);
    const filteredEvents = sortedEvents.filter(event => 
        (!eventType || event.eventType == eventType) &&
        (!sessionKey || event.sessionKey == sessionKey) &&
        (!siloKey || event.siloKey == siloKey)
    );
    const shownEvents = filteredEvents.slice(0, limit);

    if (!isAdmin) {
        return <ConversationScreen>
            <UtilityText label='Not authorized' />
        </ConversationScreen>
    }
    return <ConversationScreen>
        <Pad />
        {sessionKey && <PadBox bottom={20}><SessionSummary sessionKey={sessionKey} /></PadBox>}
        <HorizBox spread center>
            <Heading level={1} label='Event Log' />
            <CTAButton label='Refresh' onPress={onRefresh} />
        </HorizBox>
        <Pad />
        {shownEvents.map((event, i) => <PadBox vert={4} key={i}><LogEvent event={event} /></PadBox>)}
        {filteredEvents.length > limit && <PadBox top={20}><CTAButton label='Load more' onPress={() => setLimit(limit * 2)} /></PadBox>}
    </ConversationScreen>
}

function SessionSummary({sessionKey}) {
    const session = useSession({sessionKey});
    if (!session) {return null};

    return <SessionPreview session={session} />
}

export function LogEvent({event}) {
    const datastore = useDatastore();
    const selectedIdx = useSessionData(['event-selected-key']);
    const selected = selectedIdx == event.key;

    function onSelect() {
        datastore.setSessionData(['event-selected-key'], event.key);
    }

    return <HoverSelectBox selected={selected} onPress={onSelect}>    
        {selected ? <ExpandedEvent event={event} /> : <EventPreview event={event} />}
    </HoverSelectBox>
}

function EventPreview({event}) {
    const time = formatDate(event.time);
    return <PadBox horiz={8} vert={8}>
        <RichText label='**{eventType}** - {userName} - {siloKey} - {time} ' formatParams={{...event, time, userName: event.userName ?? 'anon'}}/>        
    </PadBox>
}

function ExpandedEvent({event}) {
    const datastore = useDatastore();
    const extraKeys = Object.keys(event).filter(key => ![
        'time', 'eventType', 'userName', 'text', 'url',
        'siloKey', 'sessionKey', 'instanceKey', 'structureKey'
    ].includes(key));
    return <View>
        <EventPreview event={event} />
        <Separator />
        <PadBox horiz={10} vert={10}>
            {event.eventType && <LinkedField label='Event Type' value={event.eventType} onPress={() => datastore.pushSubscreen('eventlog', {eventType: event.eventType})} />}
            {event.sessionKey && <LinkedField label='Session' value={event.sessionKey} onPress={() => datastore.pushSubscreen('eventlog', {sessionKey: event.sessionKey})} />} 
            {event.structureKey && event.instanceKey && <LinkedField label='Instance' value={event.structureKey + '/' + event.instanceKey} onPress={() => gotoInstance({structureKey: event.structureKey, instanceKey: event.instanceKey})} />} 
            {event.url && <LinkedField label='URL' value={event.url} onPress={() => window.open(event.url, '_blank')} />}
            {event.text && <Paragraph text={event.text} />}
            {extraKeys.map((key, i) => <LinkedField key={i} label={key} value={event[key]} />)}
        </PadBox>
    </View>
}

function LinkedField({label, value, onPress}) {
    return <View>
        <HorizBox>
            <UtilityText type='large' strong label={label + ': '} />
            {onPress && <TextButton onPress={onPress} text={value} />}
            {!onPress && <UtilityText type='large' text={value} />}
       </HorizBox>
       <Pad size={4} />
    </View>
}