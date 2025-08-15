import Image from "next/image";
import { JSX, useState } from "react";
import { ReactionSelector, ReactionsList, useMessageContext } from "stream-chat-react";
import MessageOptions from "./MessageOptions";

export default function CustomMessage(): JSX.Element {
    const { message } = useMessageContext();
    const [showOptions, setShowOptions] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    return (
        <div 
        onMouseEnter={() => setShowOptions(true)} 
        onMouseLeave={() => setShowOptions(false)}
        className="flex relative space-x-2 p-2 rounded-md transition-colors ease-in-out duration-200 hover:bg-gray-900">
            <Image
            className="rounded-full aspect-square object-cover w-10 h-10"
            width={40}
            height={40}
            src={message.user?.image || 'https://getstream.io/random_png/'}
            alt="User avatar"
            />
            <div>
                {showOptions && (
                    <MessageOptions showEmojiReactions={setShowReactions} />
                )}
                {showReactions && (
                    <div className="absolute">
                        <ReactionSelector />
                    </div>
                )}
                <div className="space-x-2">
                    <span className="font-semibold text-sm text-white">
                        {message.user?.name}
                    </span>
                    {message.updated_at && (
                        <span className="text-xs text-gray-500">
                            {formatDate(message.updated_at)}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500">{message.text}</p>
                <ReactionsList />
            </div>
        </div>
    );

    function formatDate(date: Date | string): string {
        if (typeof date === 'string') {
            return date;
        }
        return `${date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', })}`;
    }
}