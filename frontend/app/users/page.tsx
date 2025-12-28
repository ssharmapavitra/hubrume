'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import Modal from '@/components/Modal';

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const hasHydrated = useAuthHydration();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [messageModal, setMessageModal] = useState({ show: false, message: '', isError: false });

  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchUsers();
    fetchFollowing();
  }, [isAuthenticated, hasHydrated, router]);

  const fetchUsers = async () => {
    try {
      // Try to get users from users endpoint first
      try {
        const response = await api.get('/users');
        setUsers(response.data || []);
      } catch (err) {
        // Fallback to profiles endpoint
        const profilesResponse = await api.get('/profiles');
        setUsers(profilesResponse.data.map((p: any) => ({
          id: p.userId,
          email: p.user?.email,
          profile: p,
        })) || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await api.get('/follows/following');
      const followingIds = new Set(response.data.map((f: any) => f.followingId));
      setFollowing(followingIds);
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const showMessage = (message: string, isError: boolean = false) => {
    setMessageModal({ show: true, message, isError });
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.post(`/follows/${userId}`);
      setFollowing(new Set([...following, userId]));
      showMessage('Successfully followed user!');
    } catch (error) {
      console.error('Failed to follow user:', error);
      showMessage('Failed to follow user', true);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await api.delete(`/follows/${userId}`);
      const newFollowing = new Set(following);
      newFollowing.delete(userId);
      setFollowing(newFollowing);
      showMessage('Successfully unfollowed user!');
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      showMessage('Failed to unfollow user', true);
    }
  };

  if (loading) return <div className="p-8 bg-white text-black">Loading...</div>;

  const filteredUsers = users.filter((u) => u.id !== user?.id);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Discover Users</h1>
        {filteredUsers.length === 0 ? (
          <p className="text-black">No users found. Start following people to see them here!</p>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((userItem) => (
              <div
                key={userItem.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-between items-center"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-black">
                    {userItem.profile?.name || userItem.email}
                  </h3>
                  {userItem.profile?.bio && (
                    <p className="text-black mt-1">{userItem.profile.bio}</p>
                  )}
                  {userItem.profile?.id && (
                    <Link
                      href={`/profile/${userItem.profile.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                    >
                      View Profile →
                    </Link>
                  )}
                </div>
                <div className="ml-4">
                  {following.has(userItem.id) ? (
                    <button
                      onClick={() => handleUnfollow(userItem.id)}
                      className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(userItem.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={messageModal.show}
        onClose={() => setMessageModal({ show: false, message: '', isError: false })}
        title={messageModal.isError ? 'Error' : 'Success'}
      >
        <div className="text-black">
          <p>{messageModal.message}</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setMessageModal({ show: false, message: '', isError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

