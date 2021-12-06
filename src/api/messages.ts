import * as t from 'io-ts';
import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import { getMonoid } from 'fp-ts/Record';
import { Semigroup } from 'fp-ts/Semigroup';
import { pipe } from 'fp-ts/lib/pipeable';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as http from '../lib/http';
import * as validators from '../lib/validators';

import * as authApi from './auth';
import * as config from './config';

import { PollingParams } from 'src/state/reducers/messages';
import { Buddies, buddyType, reduceToBuddiesRecord } from './buddies';

type ApiMessage = t.TypeOf<typeof messageType>;

const messageType = t.interface({
  content: t.string,
  recipient_id: t.string,
  sender_id: t.string,
  created: validators.unixTimeFromDateString,
  opened: t.boolean,
  id: t.string,
});

export const markSeen = (message: Message) => (token: authApi.AccessToken) => {
  const url = `${config.baseUrl}/users/${token.userId}/messages/${message.messageId}`;
  const seenMessage = messageType.encode(toApiMessage(token.userId, message));

  return http.validateResponse(
    http.put(url, seenMessage, {
      headers: authApi.authHeader(token),
    }),
    t.unknown,
    _ => true,
  );
};

const messageListResponse = t.strict({
  resources: t.array(messageType),
  contacts: t.array(buddyType),
});

const toApiMessage: (userId: string, a: Message) => ApiMessage = (
  userId,
  { buddyId, messageId, type, content, isSeen, sentTime },
) => ({
  content,
  recipient_id: type === 'Sent' ? buddyId : userId,
  sender_id: type === 'Sent' ? userId : buddyId,
  id: messageId,
  created: sentTime,
  opened: isSeen,
});

export type Message = {
  buddyId: string;
  messageId: string;

  type: 'Sent' | 'Received';
  content: string;
  sentTime: number;
  isSeen: boolean;
};

const toMessage: (a: string) => (b: ApiMessage) => Message =
  userId => apiMessage => {
    const isSent = userId === apiMessage.sender_id;

    return {
      type: isSent ? 'Sent' : 'Received',
      buddyId: isSent ? apiMessage.recipient_id : apiMessage.sender_id,
      isSeen: apiMessage.opened,
      content: apiMessage.content,
      sentTime: apiMessage.created,
      messageId: apiMessage.id,
    };
  };

export type MessageMapping = Record<string, Record<string, Message>>;

const reduceToMsgRecord = (acc: MessageMapping, message: Message) => ({
  ...acc,
  [message.buddyId]: {
    ...acc[message.buddyId],
    [message.messageId]: message,
  },
});

const createFetchParams = (pollingParams: PollingParams) => {
  if (pollingParams.type === 'New' && pollingParams.previousMsgId.length > 0) {
    return `?from_message_id=${pollingParams.previousMsgId}&max=10&desc=false`;
  }

  if (pollingParams.type === 'InitialMessages') {
    const userIds = pollingParams.buddyIds.join(',');

    return `?contact_user_ids=${userIds}&max=1`;
  }

  if (pollingParams.type === 'OlderThan') {
    return `?contact_user_ids=${pollingParams.buddyId}&from_message_id=${pollingParams.messageId}&max=10&desc=true`;
  }

  return '';
};

export type MessageResponse = {
  messages: MessageMapping;
  buddies: Buddies;
};

export const fetchMessages =
  (params: PollingParams) =>
  (
    accessToken: authApi.AccessToken,
  ): TE.TaskEither<string, MessageResponse> => {
    const fetchParams = createFetchParams(params);

    return http.validateResponse(
      http.get(
        `${config.baseUrl}/users/${accessToken.userId}/messages${fetchParams}`,
        {
          headers: authApi.authHeader(accessToken),
        },
      ),
      messageListResponse,
      response => mapMessageResponse(response, accessToken),
    );
  };

const mapMessageResponse = (
  response: t.TypeOf<typeof messageListResponse>,
  accessToken: authApi.AccessToken,
) => {
  const messages = response.resources
    .map(toMessage(accessToken.userId))
    .reduce(reduceToMsgRecord, {});
  const buddies = response.contacts.reduce(reduceToBuddiesRecord, {});

  return {
    messages,
    buddies,
  };
};

export type SendMessageParams = {
  buddyId: string;
  text: string;
};

export const sendMessage =
  (params: SendMessageParams) =>
  (accessToken: authApi.AccessToken): TE.TaskEither<string, undefined> => {
    const url = `${config.baseUrl}/users/${accessToken.userId}/messages`;

    const message = {
      sender_id: accessToken.userId,
      recipient_id: params.buddyId,
      content: params.text,
      opened: false,
    };

    return pipe(
      http.post(url, message, {
        headers: authApi.authHeader(accessToken),
      }),
      TE.map(_ => undefined),
    );
  };

type buddyId = string;
type messageId = string;
export type Thread = Record<messageId, Message>;
export type Threads = Record<buddyId, Thread>;

const storageKey = (buddyId: string) => `message/${buddyId}`;

export const storeMessage = ({ text, buddyId }: SendMessageParams) =>
  TE.tryCatch(
    () => AsyncStorage.setItem(storageKey(buddyId), text),
    () => 'Failed to write message to disk.',
  );

export const readMessage = (buddyId: string) =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.getItem(storageKey(buddyId)),
      () => 'Failed to read message from disk.',
    ),
    T.map(O.fromEither),
    T.map(O.chain(O.fromNullable)),
    T.map(O.getOrElse(() => '')),
  );

const sortSentTime = (a: Message, b: Message) => {
  return a.sentTime < b.sentTime ? -1 : 1;
};

export const extractMostRecentId = (messages: MessageMapping): string => {
  const flattenedMessages = Object.keys(messages).reduce<
    Record<string, Message>
  >((acc, curr) => {
    return { ...acc, ...messages[curr] };
  }, {});

  const allMessages = Object.keys(flattenedMessages)
    .map(k => flattenedMessages[k])
    .sort(sortSentTime)
    .reverse();

  return allMessages[0]?.messageId ?? '';
};

type Msgs = Record<string, Message>;

const semiGroupMessage: Semigroup<Msgs> = {
  concat: (a: Msgs, b: Msgs) => ({ ...a, ...b }),
};
export const mergeMessageRecords = (
  newMessages: Record<string, Msgs>,
  existingMessages: Record<string, Msgs>,
) => {
  const M = getMonoid(semiGroupMessage);

  return M.concat(newMessages, existingMessages);
};
