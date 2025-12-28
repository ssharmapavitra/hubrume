'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      setProfileId(response.data.id);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/feed" className="text-xl font-bold text-black">
              Hubrume
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/feed"
                className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Feed
              </Link>
              <Link
                href="/users"
                className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Discover Users
              </Link>
              <Link
                href="/follows"
                className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Followers & Following
              </Link>
              {profileId && (
                <Link
                  href={`/profile/${profileId}`}
                  className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Resume
                </Link>
              )}
              <Link
                href="/profile/me"
                className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Edit Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-black text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-black hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

