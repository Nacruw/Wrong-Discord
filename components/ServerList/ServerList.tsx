'use client';
import { JSX, use, useCallback, useEffect, useState } from "react";
import { DiscordServer } from "@/models/DiscordServer";
import { v7 as uuid } from 'uuid';
import Image from "next/image";
import Link from "next/link";
import CreateServerForm from "./CreateServerForm";
import { useChatContext } from "stream-chat-react";
import { Channel } from "stream-chat";
import { useDiscordContext } from "@/contexts/DiscordContext";

export default function ServerList(): JSX.Element {
    const {client} = useChatContext();
    const {server: activeServer, changeServer} = useDiscordContext();
    const [serverList, setServerList] = useState<DiscordServer[]>([]);
    

    const loadServerList = useCallback(async (): Promise<void> => {
        const channels = await client.queryChannels({
            type: 'messaging',
            members: {$in: [client.userID as string]},
        });
        const serverSet: Set<DiscordServer> = new Set(
            channels
            .map((channel: Channel) => {
                const id = channel.id ?? '';
                return {
                    id,
                    name: (channel.data && (channel.data as any).name ? (channel.data as any).name : 'Unknown'),
                    image: (channel.data as { image?: string })?.image,
                };
            })
            .filter((server) => server.id !== '' && server.name !== 'Unknown')
            .filter(
                (server, index, self) =>
                    index === self.findIndex(s => s.name == server.name)
            )
        );
        const serverArray = Array.from(serverSet.values());
        setServerList(serverArray);
        if (serverArray.length > 0) {
            changeServer(serverArray[0], client);
        }
}, [client, changeServer]);

useEffect(() => {
    loadServerList();
}, [loadServerList]);


    return <div className='bg-dark-gray h-full flex flex-col items-center'>

            <button
            className={`block p-3 aspect-square sidebar-icon border-b-2 border-b-gray-300 ${activeServer === undefined ? 'selected-icon' : ''}`}
            onClick={() => changeServer(undefined, client)}
            >
                <div className="rounded-icon discord-icon"/>
            </button>
            {serverList.map((server) => (
                <button key ={server.id} 
                className={`p-4 sidebar-icon ${server.id === activeServer?.id ? 'selected-icon' : ''}`}
                onClick={() => changeServer(server, client)}>
                    {server.image && CheckIfUrl(server.image) ? (
                        <Image
                        className = 'rounded-icon'
                        src={server.image}
                        width={50}
                        height={50}
                        alt={server.name}
                        />
                    ) : (
                        <span className='rounded-icon bg-gray-600 w-[50px] flex items-center justify-center text-sm'>
                            {server.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </button>
            ))}
        <Link 
        href={'/?createServer=true'}
        className='flex items-center justify-center rounded-icon bg-white p-2 my-2 text-2xl font-light h-12 w-12 text-green-500 hover:bg-green-500 hover:text-white hover:rounded-xl transition-all duration-200'  
       > 
       <span className='inline-block'>+</span>
       </Link>
       <CreateServerForm />
    </div>;
};

function CheckIfUrl(path: string): boolean {
    try {
        const _ = new URL(path);
        return true;
    } catch (_) {
        return false;
    }
}
