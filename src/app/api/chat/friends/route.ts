import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Follow from "@/models/Follow";
import User from "@/models/User";
import Message from "@/models/Message";
import { cookies } from "next/headers";

// Helper to determine if user is online (active in last 5 minutes)
const isUserOnline = (lastActiveAt?: Date | null) => {
    if (!lastActiveAt) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastActiveAt) > fiveMinutesAgo;
};

export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken<{ id: string }>(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const currentUserId = decoded.id;

        // Update Current User's Last Active Timestamp
        await User.findByIdAndUpdate(currentUserId, { lastActiveAt: new Date() });

        // 1. Find who I am following
        const following = await Follow.find({ followerId: currentUserId });
        const followingIds = following.map((f) => f.followingId.toString());

        // 2. Find who follows me back (Mutual)
        const followers = await Follow.find({
            followingId: currentUserId,
            followerId: { $in: followingIds },
        });

        const friendIds = followers.map((f) => f.followerId);

        // 3. Get User Details
        const friends = await User.find({ _id: { $in: friendIds } })
            .select("name username studentId avatarUrl role statusText lastActiveAt")
            .lean();

        // 4. Calculate Unread Counts for each friend
        // We count messages where sender is the friend, receiver is me, and read is false
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    senderId: { $in: friends.map(f => f._id) },
                    receiverId: decoded.id, // converted to ObjectId automatically by mongoose or needs casting?
                    // verifyToken returns string ID. Mongoose often handles string->ObjectId casting, but aggregate might need exact types.
                    // Let's assume Mongoose handles it for now or we might need `new mongoose.Types.ObjectId(decoded.id)`
                    read: false
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map for fast lookup
        const unreadMap: Record<string, number> = {};
        unreadCounts.forEach((u: any) => {
            unreadMap[u._id.toString()] = u.count;
        });

        // Match stage needs ObjectId usually. Let's fix potential issue.
        // If aggregates fail, we can do a simpler Promise.all countDocuments approach which is safer for small friend lists.
        // Given usage, let's switch to Promise.all for reliability without dealing with ObjectId casting quirks in aggregation pipeline right now.

        const formattedFriends = await Promise.all(friends.map(async (f: any) => {
            const count = await Message.countDocuments({
                senderId: f._id,
                receiverId: currentUserId,
                read: false
            });

            return {
                _id: f._id,
                name: f.name,
                username: f.username,
                studentId: f.studentId,
                avatarUrl: f.avatarUrl,
                role: f.role,
                statusText: f.statusText,
                isOnline: isUserOnline(f.lastActiveAt),
                unreadCount: count // Added unread count
            };
        }));

        return NextResponse.json({ friends: formattedFriends });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
