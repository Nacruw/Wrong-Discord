'use client';

import { DiscordServer } from '@/models/DiscordServer';
import { MemberRequest, StreamVideoClient } from '@stream-io/video-react-sdk';
import { createContext, useCallback, useContext, useState } from 'react';
import { StreamChat, Channel, ChannelFilters } from 'stream-chat';
import { v7 as uuid } from 'uuid';

// Extend ChannelData once and reuse it everywhere
interface CustomChannelData {
  name: string;
  members: string[];
  image?: string;
  serverId?: string;
  server?: string;
  category?: string;
}

type DiscordState = {
  server?: DiscordServer;
  callId: string | undefined;
  channelsByCategories: Map<string, Array<Channel>>;
  changeServer: (server: DiscordServer | undefined, client: StreamChat) => void;
  createServer: (
    client: StreamChat,
    videoClient: StreamVideoClient,
    name: string,
    imageUrl: string,
    userIds: string[]
  ) => Promise<any>;
  createChannel: (
    client: StreamChat,
    name: string,
    category: string,
    userIds: string[]
  ) => void;
  createCall: (
    client: StreamVideoClient,
    server: DiscordServer,
    channelName: string,
    userIds: string[]
  ) => Promise<void>;
  setCall: (callId: string | undefined) => void;
};

const initialValue: DiscordState = {
  server: undefined,
  callId: undefined,
  channelsByCategories: new Map(),
  changeServer: () => {},
  createServer: async () => {},
  createChannel: () => {},
  createCall: async () => {},
  setCall: () => {},
};

const DiscordContext = createContext<DiscordState>(initialValue);

export const DiscordContextProvider: any = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [myState, setMyState] = useState<DiscordState>(initialValue);

  const changeServer = useCallback(
    async (server: DiscordServer | undefined, client: StreamChat) => {
      let filters: ChannelFilters = {
        type: 'messaging',
        members: { $in: [client.userID as string] },
      };

      if (!server) {
        filters.member_count = 2;
      }

      const channels = await client.queryChannels(filters);
      const channelsByCategories = new Map<string, Array<Channel>>();

      if (server) {
        const categories = new Set(
          channels
            .filter((channel) => (channel.data as CustomChannelData)?.server === server.name)
            .map(
              (channel) =>
                (channel.data as CustomChannelData)?.category || 'Uncategorized'
            )
        );

        for (const category of Array.from(categories)) {
          channelsByCategories.set(
            category,
            channels.filter(
              (channel) =>
                (channel.data as CustomChannelData)?.server === server.name &&
                ((channel.data as CustomChannelData)?.category || 'Uncategorized') === category
            )
          );
        }
      } else {
        channelsByCategories.set('Direct Messages', channels);
      }

      setMyState((prev) => ({
        ...prev,
        server,
        channelsByCategories,
      }));
    },
    []
  );

  const createCall = useCallback(
    async (
      client: StreamVideoClient,
      server: DiscordServer,
      channelName: string,
      userIds: string[]
    ) => {
      const callId = uuid();
      const audioCall = client.call('default', callId);

      const audioChannelMembers: MemberRequest[] = userIds.map((userId) => ({
        user_id: userId,
      }));

      try {
        const createAudioCall = await audioCall.create({
          data: {
            custom: {
              serverId: server.id,
              serverName: server.name,
              callName: channelName,
            },
            members: audioChannelMembers,
          },
        });
        console.log(`[DiscordContext] Created Call with id: ${createAudioCall.call.id}`);
      } catch (err) {
        console.error('Error creating call:', err);
      }
    },
    []
  );

  const createServer = useCallback(
    async (
      client: StreamChat,
      videoClient: StreamVideoClient,
      name: string,
      imageUrl: string,
      userIds: string[]
    ) => {
      const serverId = uuid();
      const serverChannelId = uuid();

      const messagingChannel = client.channel('messaging', serverChannelId, {
        name,
        members: userIds,
        image: imageUrl,
        serverId,
        server: name,
        category: 'Text Channels',
      } as CustomChannelData);

      try {
        const response = await messagingChannel.create();
        const newServer: DiscordServer = { id: serverId, name, image: imageUrl };

        // Update context immediately
        await changeServer(newServer, client);

        // Create default VC for the server
        await createCall(videoClient, newServer, 'General VC', userIds);

        console.log('Server created successfully:', response);
        return response;
      } catch (err) {
        console.error('Error creating server:', err);
      }
    },
    [changeServer, createCall]
  );

  const createChannel = useCallback(
    async (
      client: StreamChat,
      name: string,
      category: string,
      userIds: string[]
    ) => {
      if (client.userID && myState.server) {
        const channelId = uuid();
        const channel = client.channel('messaging', channelId, {
          name,
          members: userIds,
          image: myState.server.image,
          serverId: myState.server.id,
          server: myState.server.name,
          category,
        } as CustomChannelData);

        try {
          const response = await channel.create();
          await changeServer(myState.server, client);
          console.log('Channel created successfully:', response);
        } catch (err) {
          console.error('Error creating channel:', err);
        }
      }
    },
    [myState.server, changeServer]
  );

  const setCall = useCallback((callId: string | undefined) => {
    setMyState((prev) => ({
      ...prev,
      callId,
    }));
  }, []);

  const store: DiscordState = {
    server: myState.server,
    callId: myState.callId,
    channelsByCategories: myState.channelsByCategories,
    changeServer,
    createServer,
    createChannel,
    createCall,
    setCall,
  };

  return (
    <DiscordContext.Provider value={store}>
      {children}
    </DiscordContext.Provider>
  );
};

export const useDiscordContext = () => useContext(DiscordContext);
