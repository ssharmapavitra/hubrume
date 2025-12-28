'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import api from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const hasHydrated = useAuthHydration();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration
    
    if (isAuthenticated && user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, hasHydrated]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      setProfileId(response.data.id);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-black">Welcome to Hubrume</h1>
          <p className="text-lg text-black">Create your resume profile, follow others, and share posts</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Welcome back, {user?.email}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/feed"
            className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-xl font-semibold text-black mb-2">Feed</h2>
            <p className="text-black">View posts from people you follow</p>
          </Link>
          {profileId ? (
            <Link
              href={`/profile/${profileId}`}
              className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              <h2 className="text-xl font-semibold text-black mb-2">My Resume</h2>
              <p className="text-black">View and download your resume</p>
            </Link>
          ) : (
            <Link
              href="/profile/me"
              className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              <h2 className="text-xl font-semibold text-black mb-2">Create Resume</h2>
              <p className="text-black">Set up your resume profile</p>
            </Link>
          )}
          <Link
            href="/profile/me"
            className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-xl font-semibold text-black mb-2">Edit Resume</h2>
            <p className="text-black">Update your resume information</p>
          </Link>
          <Link
            href="/users"
            className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-xl font-semibold text-black mb-2">Discover Users</h2>
            <p className="text-black">Find and follow other users</p>
          </Link>
          <Link
            href="/follows"
            className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            <h2 className="text-xl font-semibold text-black mb-2">Followers & Following</h2>
            <p className="text-black">Manage your followers and following list</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
