import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import mongoose from "mongoose";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
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

        const { messageId, emoji } = await req.json();

        if (!messageId || !emoji) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Ensure reactions array exists (for older messages or schema mismatches)
        if (!message.reactions) {
            message.reactions = [];
        }

        // Toggle logic: If user already reacted with this emoji, remove it. Else add it.
        const existingReactionIndex = message.reactions.findIndex(
            (r: any) => r.userId.toString() === user.id && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
            // Remove reaction
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Add reaction
            message.reactions.push({
                emoji,
                userId: new mongoose.Types.ObjectId(user.id),
                createdAt: new Date(),
            });
        }

        await message.save();

        return NextResponse.json({ message });
    } catch (err) {
        console.error("Error updating reaction:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
