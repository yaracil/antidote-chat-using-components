import {AddParticipantsRequest, ChatClient} from '@azure/communication-chat';
import {AzureCommunicationTokenCredential, CommunicationUserIdentifier} from '@azure/communication-common';
import {
    CallComposite,
    ChatComposite,
    fromFlatCommunicationIdentifier,
    useAzureCommunicationCallAdapter,
    useAzureCommunicationChatAdapter
} from '@azure/communication-react';
import React, {CSSProperties, useEffect, useMemo, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

/**
 * Authentication information needed for your client application to use
 * Azure Communication Services.
 *
 * For this quickstart, you can obtain these from the Azure portal as described here:
 * https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/identity/quick-create-identity
 *
 * In a real application, your backend service would provide these to the client
 * application after the user goes through your authentication flow.
 */
const ENDPOINT_URL = 'https://chat-quickstart.communication.azure.com/';
const CREATOR_USER_ID = '8:acs:b6302650-9cc6-4066-a357-ba036fa38f50_00000013-24b1-ef39-570c-113a0d00826c';
const DEFAULT_DISPLAY_NAME = 'Chat User Test';
const CREATOR_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNiIsIng1dCI6Im9QMWFxQnlfR3hZU3pSaXhuQ25zdE5PU2p2cyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOmI2MzAyNjUwLTljYzYtNDA2Ni1hMzU3LWJhMDM2ZmEzOGY1MF8wMDAwMDAxMy0yNGIxLWVmMzktNTcwYy0xMTNhMGQwMDgyNmMiLCJzY3AiOjE3OTIsImNzaSI6IjE2NjAwODU2MTkiLCJleHAiOjE2NjAxNzIwMTksImFjc1Njb3BlIjoiY2hhdCx2b2lwIiwicmVzb3VyY2VJZCI6ImI2MzAyNjUwLTljYzYtNDA2Ni1hMzU3LWJhMDM2ZmEzOGY1MCIsImlhdCI6MTY2MDA4NTYxOX0.FydpOCiqTE29O_yU-INr2gF8fsTHjCW8pKxbEHfxC77qvOSjAXpAe0K6SmlBrqpnAKr2HEEF41n8rzDmgmFoIV3j4V_4kINjSExwlJ4JU2mQY11IyB21cIuUhbF_W1juuwZ7kWzaHbwhme9rPrl_ENIgSGw7Fv8lSmZNYe73umv8gEQYVRunuDMKr_dOv7Ktccljwfd20FlpVse-Ic7PFkTv24qRqm2zLg2zlxxyau03r54qIJBqNQopnvLFJ53vdWwuZF4h_fjj4H6oqsU_CJ7kkvyfJbRpNI17gTixpF-vOrKcoRj663IMydFngMupEl9JK167qPECh4MBSzf5KQ';

/**
 * Display name for the local participant.
 * In a real application, this would be part of the user data that your
 * backend services provides to the client application after the user
 * goes through your authentication flow.
 */

/**
 * Entry point of your application.
 */
function App(): JSX.Element {
    // Arguments that would usually be provided by your backend service or
    // (indirectly) by the user.
    const [initialized, setInitialized] = React.useState<boolean>(false);
    const [contextUserId, setContextUserId] = React.useState<string>(CREATOR_USER_ID);
    const [contextUserDisplayName, setContextUserDisplayName] = React.useState<string>(DEFAULT_DISPLAY_NAME);
    const [contextThreadId, setContextThreadId] = React.useState<string>('none');
    const [contextToken, setContextToken] = React.useState<string>(CREATOR_TOKEN);
    const {
        endpointUrl,
        groupId,
        threadId
    } = useAzureCommunicationServiceArgs({
        initialized,
        contextUserId,
        contextUserDisplayName,
        contextThreadId
    });

    React.useEffect(() => {
        const getExistingThreadIdFromURL = async (): Promise<void> => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlContextThreadId = urlParams.get('threadId');
            if (urlContextThreadId) {
                console.log("urlContextThreadId context value " + urlContextThreadId);
                await setContextThreadId(urlContextThreadId);
            } else {
                setContextThreadId('');
            }
            const urlUserId = urlParams.get('userId');
            if (urlUserId) {
                console.log("urlUserId context value " + urlUserId);
                await setContextUserId(urlUserId);
            }
            const urlUserDisplayName = urlParams.get('displayName');
            if (urlUserDisplayName) {
                console.log("urlUserDisplayName context value " + urlUserDisplayName);
                await setContextUserDisplayName(urlUserDisplayName);
            }
            const urlToken = urlParams.get('token');
            if (urlToken) {
                console.log("urlToken context value " + urlToken);
                await setContextToken(urlToken);
            }
            setInitialized(true);
        };
        getExistingThreadIdFromURL()
    }, [])

    // A well-formed token is required to initialize the chat and calling adapters.
    const credential = useMemo(() => {
        try {
            return new AzureCommunicationTokenCredential(contextToken);
        } catch {
            console.error('Failed to construct token credential');
            return undefined;
        }
    }, [contextToken]);

    // Memoize arguments to `useAzureCommunicationCallAdapter` so that
    // a new adapter is only created when an argument changes.
    const callAdapterArgs = useMemo(
        () => ({
            userId: fromFlatCommunicationIdentifier(contextUserId) as CommunicationUserIdentifier,
            displayName: contextUserDisplayName,
            credential,
            locator: {groupId}
        }),
        [contextUserId, credential, contextUserDisplayName, groupId]
    );
    const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

    // Memoize arguments to `useAzureCommunicationChatAdapter` so that
    // a new adapter is only created when an argument changes.
    const chatAdapterArgs = useMemo(
        () => ({
            endpoint: endpointUrl,
            userId: fromFlatCommunicationIdentifier(contextUserId) as CommunicationUserIdentifier,
            displayName: contextUserDisplayName,
            credential,
            threadId
        }),
        [endpointUrl, contextUserId, contextUserDisplayName, credential, threadId]
    );
    const chatAdapter = useAzureCommunicationChatAdapter(chatAdapterArgs);

    if (initialized && !!callAdapter && !!chatAdapter) {
        return (
            <div style={{height: '100vh', display: 'flex'}}>
                <div style={containerStyle}>
                    <ChatComposite adapter={chatAdapter}/>
                </div>
                <div style={containerStyle}>
                    <CallComposite adapter={callAdapter}/>
                </div>
            </div>
        );
    }
    if (credential === undefined) {
        return <h3>Failed to construct credential. Provided token is malformed.</h3>;
    }
    return <div><h3>Initializing... </h3></div>;
}

const containerStyle: CSSProperties = {
    border: 'solid 0.125rem olive',
    margin: '0.5rem',
    width: '50vw'
};

/**
 * This hook returns all the arguments required to use the Azure Communication services
 * that would be provided by your backend service after user authentication
 * depending on the user-flow (e.g. which chat thread to use).
 */
function useAzureCommunicationServiceArgs({
                                              initialized,
                                              contextUserId,
                                              contextUserDisplayName,
                                              contextThreadId
                                          }: { initialized: boolean, contextUserId: string, contextUserDisplayName: string, contextThreadId: string }): {
    endpointUrl: string;
    groupId: string;
    threadId: string;
} {
    const [threadId, setThreadId] = useState('');
    // For the quickstart, create a new thread with just the local participant in it.
    useEffect(() => {
        if (initialized && contextThreadId !== 'none') {
            (async () => {
                const client = new ChatClient(ENDPOINT_URL, new AzureCommunicationTokenCredential(CREATOR_TOKEN));
                if (!contextThreadId) {
                    const {chatThread} = await client.createChatThread(
                        {
                            topic: 'Composites Quickstarts'
                        },
                        {
                            participants: [
                                {
                                    id: fromFlatCommunicationIdentifier(contextUserId),
                                    displayName: contextUserDisplayName
                                }
                            ]
                        }
                    );
                    console.log("new threadId: " + chatThread?.id);
                    setThreadId(chatThread?.id ?? '');
                } else {
                    const chatThreadClient = client.getChatThreadClient(contextThreadId);

                    const addParticipantsRequest: AddParticipantsRequest =
                        {
                            participants: [{
                                id: fromFlatCommunicationIdentifier(contextUserId),
                                displayName: contextUserDisplayName
                            }]
                        };
                    await chatThreadClient.addParticipants(addParticipantsRequest);
                    setThreadId(contextThreadId);
                }
            })();
        }
    }, [contextThreadId, contextUserDisplayName, contextUserId, initialized]);

    // For the quickstart, generate a random group ID.
    // The group Id must be a UUID.
    const groupId = useRef(uuidv4());

    return {
        endpointUrl: ENDPOINT_URL,
        groupId: groupId.current,
        threadId
    };
}

export default App;
