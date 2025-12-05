import mongoose, { Schema, Document, Model } from "mongoose";

interface IReaction {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    read: boolean;
    createdAt: Date;
    reactions: IReaction[]; // Added reactions array
}

const ReactionSchema = new Schema({
    emoji: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

const MessageSchema: Schema<IMessage> = new Schema(
    {
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true },
        read: { type: Boolean, default: false },
        reactions: [ReactionSchema], // Added reactions
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for efficiently fetching chat history between two users
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });

// Prevent Mongoose Recompilation Errors in Development
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Message;
}

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
