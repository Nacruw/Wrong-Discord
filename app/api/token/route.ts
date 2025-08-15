import { StreamChat } from "stream-chat";

export async function POST(request: Request) {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
        return Response.error();
    }
    const serverClient = StreamChat.getInstance(apiKey, process.env.STREAM_SECRET);
    const body = await request.json();
    console.log('[/api/token] body:', body);
    
    const userId = body?.userId;

    if (!userId) {
        return Response.error();
    }

    const token = serverClient.createToken(userId);

    const response = {
        userId: userId,
        token: token,
    };

    return Response.json(response);
}