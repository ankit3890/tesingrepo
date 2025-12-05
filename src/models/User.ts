// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  studentId: string;
  email: string;
  passwordHash: string;

  name?: string;
  firstName?: string;
  lastName?: string;
  branch?: string;
  year?: number;
  cyberUserName?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  role?: "student" | "admin" | "superadmin" | "tester";
  profilePhoto?: string;
  hasSyncedFromCyberVidya: boolean;
  username?: string;

  isBanned?: boolean;
  bannedReason?: string | null;
  bannedUntil?: Date | null;
  lastActiveAt?: Date | null;
  hideContacts?: boolean;

  // New Profile Fields
  displayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  bio?: string;
  statusText?: string;
  interests?: string[];
  skills?: string[];
  socials?: {
    github?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
  };
  isPublicProfile?: boolean;
  showBranchYear?: boolean;
  followersCount?: number;
  followingCount?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    studentId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    name: String,
    firstName: String,
    lastName: String,
    branch: String,
    year: Number,
    cyberUserName: String,
    mobileNumber: String,
    dateOfBirth: String,
    gender: String,

    role: {
      type: String,
      enum: ["student", "admin", "superadmin", "tester"],
      default: "student",
    },

    profilePhoto: String,

    hasSyncedFromCyberVidya: {
      type: Boolean,
      default: false,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    bannedReason: {
      type: String,
      default: null,
    },

    bannedUntil: {
      type: Date,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },
    hideContacts:
      { type: Boolean, default: false },

    // --- NEW PROFILE FIELDS ---
    displayName: { type: String },

    avatarUrl: { type: String },
    bannerUrl: { type: String },
    accentColor: {
      type: String,
      default: "#3b82f6", // blue accent
    },

    bio: {
      type: String,
      default: "",
      maxlength: 280,
    },

    statusText: {
      type: String,
      default: "",
      maxlength: 80,
    },

    interests: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    socials: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },

    // privacy preferences
    isPublicProfile: {
      type: Boolean,
      default: true,
    },
    showBranchYear: {
      type: Boolean,
      default: true,
    },

    // social stats (for future follow system)
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Force new model compilation to ensure schema updates are applied
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "users");

export default User;

