import { useClient } from '@/hooks/useClient';
import { User } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  useCreateChatClient,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import ServerList from './ServerList/ServerList';
import CustomChannelList from './ChannelList/CustomChannelList';
import CustomDateSeparator from './MessageList/CustomDateSeparator/CustomDateSeparator';
import CustomChannelHeader from './MessageList/CustomChannelHeader/CustomChannelHeader';
import CustomMessage from './MessageList/CustomMessage/CustomMessage';
import { customReactionOptions } from './MessageList/CustomMessage/customMessageReactions';
import MessageComposer from './MessageList/MessageComposer/MessageComposer';
import { useVideoClient } from '@/hooks/useVideoClient';
import { StreamVideo } from '@stream-io/video-react-sdk';
import { useDiscordContext } from '@/contexts/DiscordContext';
import MyCall from './MyCall/MyCall';

export default function MyChat({apiKey, user, token}: { apiKey: string; user: User; token: string }) {
const chatClient = useCreateChatClient({
    apiKey: apiKey,
    userData: user,
    tokenOrProvider: token,
  });

const videoClient = useVideoClient({
    apiKey: apiKey,
     user,
    tokenOrProvider: token,
  });

const { callId } = useDiscordContext();

  if (!chatClient) {
    return <div>Loading...</div>;
  }

  if (!videoClient) {
    return <div>Video Error, please try again later.</div>;
  }

  return (
    <StreamVideo client={videoClient}>
    <Chat client={chatClient} theme="str-chat__theme-dark">
        <section className='flex h-screen w-screen layout'>
          <ServerList/>
            <ChannelList List={CustomChannelList}/>
            {callId && <MyCall callId={callId} />}
            {!callId && (
            <Channel DateSeparator={CustomDateSeparator} HeaderComponent={CustomChannelHeader} Message={CustomMessage} reactionOptions={customReactionOptions} Input={MessageComposer}>
                <Window>
                <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                </Window>
                <Thread />
            </Channel>
          )}
        </section>
    </Chat>
    </StreamVideo>
  );
}