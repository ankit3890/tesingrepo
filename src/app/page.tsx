// src/app/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  _id?: string;
  studentId: string;
  name?: string;
  email?: string;
  username?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const logActivity = async (action: string, details: string) => {
    try {
      await fetch("/api/log/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, details }),
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const raw = await res.json();
          const u: User | undefined = raw.user ?? raw;
          setUser(u ?? null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckedAuth(true);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero Section / Welcome Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            College<span className="text-indigo-600 dark:text-indigo-400">Connect</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Your all-in-one academic companion. Track attendance, view syllabus, and connect with peers.
          </p>
        </div>

        {/* Loading State */}
        {!checkedAuth && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Logged In View */}
        {checkedAuth && user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-slate-900 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">Dashboard</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Access all your tools</p>
                </div>
              </div>
            </Link>

            {/* Attendance */}
            <Link
              href="/attendance"
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-slate-900 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">Attendance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Check your records</p>
                </div>
              </div>
            </Link>

            {/* Syllabus */}
            <Link
              href="/syllabus/search"
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-slate-900 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">Syllabus</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Find course resources</p>
                </div>
              </div>
            </Link>

            {/* Messages / Chat (NEW) */}
            <Link
              href="/chat"
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-slate-900 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 transition-colors">
                  <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 transition-colors">Messages</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Chat with friends</p>
                </div>
              </div>
            </Link>


            {/* Profile */}
            <Link
              href={`/u/${user?.username || user?.studentId}`}
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-2 border-slate-900 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">Profile</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your public identity</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Guest View */}
        {checkedAuth && !user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Login</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Access your dashboard, check attendance, and manage your profile using your Student ID.
              </p>
              <Link href="/login" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Login to continue &rarr;
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Register</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                New here? Set up your account with your CyberVidya credentials in seconds.
              </p>
              <Link href="/register" className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Create account &rarr;
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
