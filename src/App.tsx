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
// const USER_ID = '8:acs:a5681390-2336-476e-b7c8-5b87c9fba94a_00000013-1012-b11a-570c-113a0d00bf5e';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNiIsIng1dCI6Im9QMWFxQnlfR3hZU3pSaXhuQ25zdE5PU2p2cyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOmE1NjgxMzkwLTIzMzYtNDc2ZS1iN2M4LTViODdjOWZiYTk0YV8wMDAwMDAxMy0xMTUzLWU3YWMtN2YwNy0xMTNhMGQwMGQwNzciLCJzY3AiOjE3OTIsImNzaSI6IjE2NTk3NjA2OTAiLCJleHAiOjE2NTk4NDcwOTAsImFjc1Njb3BlIjoiY2hhdCx2b2lwIiwicmVzb3VyY2VJZCI6ImE1NjgxMzkwLTIzMzYtNDc2ZS1iN2M4LTViODdjOWZiYTk0YSIsImlhdCI6MTY1OTc2MDY5MH0.RT53jSSQrwMXhJE7vBV4sifgx7slBfxBaQ0SExWIawCFn1b91_mmBHnkADdZ3lrO67rWpSOTh3FpUAlzkLjbgx0kysDyztU0G5wPBvNtKcTlobPovY7ULhnzg9yFsreB5IXyJEAFXr2o7xqKISbqU5y5mVLI4iKuPfMYgRC-DcwIWAH_cuvL87P3hpdz5Dmg2KZ_-z8_XoJ58eej6inMlUGFBiVHZ7831H-GEqa1Puaw9xaRffFkuI1QKuuAGCTJfnyA1aRs1ewstMNXzlnues0r0SkU85S5phMfldQB0q516MnG1pEyGvPUFVhAJ91lIkTfI8yKinVE3KUPiEUa9w';

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
    const [contextUserId, setContextUserId] = React.useState<string>('');
    const [contextUserDisplayName, setContextUserDisplayName] = React.useState<string>('');
    const [contextThreadId, setContextThreadId] = React.useState<string>('none');
    const {
        endpointUrl,
        userId,
        token,
        displayName,
        groupId,
        threadId
    } = useAzureCommunicationServiceArgs({contextUserId, contextUserDisplayName, contextThreadId});

    React.useEffect(() => {
        const getExistingThreadIdFromURL = (): void => {
            const urlParams = new URLSearchParams(window.location.search);

            const urlContextThreadId = urlParams.get('threadId');
            if (urlContextThreadId) {
                console.log("urlContextThreadId context value " + urlContextThreadId);
                setContextThreadId(urlContextThreadId);
            } else {
                setContextThreadId('');
            }
            const urlUserId = urlParams.get('userId');
            if (urlUserId) {
                console.log("urlUserId context value " + urlUserId);
                setContextUserId(urlUserId);
            }
            const urlUserDisplayName = urlParams.get('displayName');
            if (urlUserDisplayName) {
                console.log("urlUserDisplayName context value " + urlUserDisplayName);
                setContextUserDisplayName(urlUserDisplayName);
            }
        };
        getExistingThreadIdFromURL()
    }, [])

    // A well-formed token is required to initialize the chat and calling adapters.
    const credential = useMemo(() => {
        try {
            return new AzureCommunicationTokenCredential(token);
        } catch {
            console.error('Failed to construct token credential');
            return undefined;
        }
    }, [token]);

    // Memoize arguments to `useAzureCommunicationCallAdapter` so that
    // a new adapter is only created when an argument changes.
    const callAdapterArgs = useMemo(
        () => ({
            userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
            displayName,
            credential,
            locator: {groupId}
        }),
        [userId, credential, displayName, groupId]
    );
    const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

    // Memoize arguments to `useAzureCommunicationChatAdapter` so that
    // a new adapter is only created when an argument changes.
    const chatAdapterArgs = useMemo(
        () => ({
            endpoint: endpointUrl,
            userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
            displayName,
            credential,
            threadId
        }),
        [endpointUrl, userId, displayName, credential, threadId]
    );
    const chatAdapter = useAzureCommunicationChatAdapter(chatAdapterArgs);

    if (!!callAdapter && !!chatAdapter) {
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
    return <h3>Initializing...</h3>;
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
                                              contextUserId,
                                              contextUserDisplayName,
                                              contextThreadId
                                          }: { contextUserId: string, contextUserDisplayName: string, contextThreadId: string }): {
    endpointUrl: string;
    userId: string;
    token: string;
    displayName: string;
    groupId: string;
    threadId: string;
} {
    const [threadId, setThreadId] = useState('');
    // For the quickstart, create a new thread with just the local participant in it.
    useEffect(() => {
        if (contextUserId && contextUserDisplayName && contextThreadId !== 'none') {
            (async () => {
                const client = new ChatClient(ENDPOINT_URL, new AzureCommunicationTokenCredential(TOKEN));
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

                    const response = await chatThreadClient.listParticipants();
                    const participants_ = [];
                    let prt = await response?.next();
                    while (!prt?.done) {
                        participants_.push(prt?.value)
                        prt = await response?.next();
                    }

                    const addParticipantsRequest: AddParticipantsRequest =
                        {
                            participants: [
                                ...participants_,
                                ...[{
                                    id: fromFlatCommunicationIdentifier(contextUserId),
                                    displayName: contextUserDisplayName
                                }]
                            ]
                        };
                    await chatThreadClient.addParticipants(addParticipantsRequest);
                    setThreadId(contextThreadId);
                }
            })();
        }
    }, [contextUserId, contextUserDisplayName, contextThreadId]);

    // For the quickstart, generate a random group ID.
    // The group Id must be a UUID.
    const groupId = useRef(uuidv4());

    return {
        endpointUrl: ENDPOINT_URL,
        userId: contextUserId,
        token: TOKEN,
        displayName: contextUserDisplayName,
        groupId: groupId.current,
        threadId
    };
}

export default App;
