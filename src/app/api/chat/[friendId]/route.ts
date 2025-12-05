import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";

// GET: Fetch messages with a friend
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ friendId: string }> }
) {
    await connectDB();
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = verifyToken<{ id: string }>(token);
        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { friendId } = await params;
        const currentUserId = user.id;

        // Update Last Active
        await User.findByIdAndUpdate(currentUserId, { lastActiveAt: new Date() });

        // Mark messages from this friend as read
        await Message.updateMany(
            { senderId: friendId, receiverId: currentUserId, read: false },
            { $set: { read: true } }
        );

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: friendId },
                { senderId: friendId, receiverId: currentUserId },
            ],
        }).sort({ createdAt: 1 }); // Oldest first

        // Decrypt content
        const decryptedMessages = messages.map(msg => ({
            ...msg.toObject(),
            content: decrypt(msg.content)
        }));

        return NextResponse.json({ messages: decryptedMessages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST: Send a message
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ friendId: string }> }
) {
    await connectDB();
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = verifyToken<{ id: string }>(token);
        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { friendId } = await params;
        const currentUserId = user.id;
        const { content } = await req.json();

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        // Update Last Active
        await User.findByIdAndUpdate(currentUserId, { lastActiveAt: new Date() });

        // Encrypt content before saving
        const encryptedContent = encrypt(content);

        const newMessage = await Message.create({
            senderId: currentUserId,
            receiverId: friendId,
            content: encryptedContent,
        });

        // Return the original content to the UI so it displays immediately without needing decryption round-trip (or just return decrypted)
        const responseMessage = {
            ...newMessage.toObject(),
            content: content // Send back cleartext to the sender
        };

        return NextResponse.json({ message: responseMessage }, { status: 201 });
    } catch (err) {
        console.error("Error sending message:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
