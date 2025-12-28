'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';

export default function FollowsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const hasHydrated = useAuthHydration();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState({ show: false, message: '', isError: false });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: () => {} });

  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAllData();
  }, [isAuthenticated, hasHydrated, router]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [followersResponse, followingResponse] = await Promise.all([
        api.get('/follows/followers'),
        api.get('/follows/following'),
      ]);
      setFollowers(followersResponse.data);
      setFollowing(followingResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showMessage('Failed to load data', true);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    // Refresh current tab data
    await fetchAllData();
  };

  const showMessage = (message: string, isError: boolean = false) => {
    setMessageModal({ show: true, message, isError });
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.post(`/follows/${userId}`);
      showMessage('Successfully followed user!');
      // Refresh both lists
      await fetchData();
    } catch (error: any) {
      console.error('Failed to follow user:', error);
      showMessage(error.response?.data?.message || 'Failed to follow user', true);
    }
  };

  const handleUnfollow = (userId: string, userName: string) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to unfollow ${userName}?`,
      onConfirm: async () => {
        try {
          await api.delete(`/follows/${userId}`);
          showMessage('Successfully unfollowed user!');
          setConfirmModal({ show: false, message: '', onConfirm: () => {} });
          // Refresh both lists
          await fetchData();
        } catch (error: any) {
          console.error('Failed to unfollow user:', error);
          showMessage(error.response?.data?.message || 'Failed to unfollow user', true);
          setConfirmModal({ show: false, message: '', onConfirm: () => {} });
        }
      },
    });
  };

  const isFollowingUser = (userId: string) => {
    return following.some((f) => f.following?.id === userId);
  };

  if (loading) return <div className="p-8 bg-white text-black">Loading...</div>;

  const currentUser = activeTab === 'followers' ? followers : following;
  const userKey = activeTab === 'followers' ? 'follower' : 'following';

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Followers & Following</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'followers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'following'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Content */}
        {currentUser.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
            <p className="text-black">
              {activeTab === 'followers'
                ? 'You have no followers yet.'
                : "You're not following anyone yet."}
            </p>
            {activeTab === 'following' && (
              <Link
                href="/users"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Discover Users
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentUser.map((item) => {
              const targetUser = item[userKey];
              const profile = targetUser?.profile;
              const displayName = profile?.name || targetUser?.email;
              const isFollowing = activeTab === 'followers' ? isFollowingUser(targetUser?.id) : true;

              return (
                <div
                  key={item.id || targetUser?.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black">{displayName}</h3>
                    {profile?.bio && (
                      <p className="text-black mt-1 text-sm">{profile.bio}</p>
                    )}
                    {profile?.id && (
                      <Link
                        href={`/profile/${profile.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        View Profile →
                      </Link>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    {activeTab === 'followers' && (
                      <>
                        {isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(targetUser?.id, displayName)}
                            className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 text-sm"
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(targetUser?.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Follow Back
                          </button>
                        )}
                      </>
                    )}
                    {activeTab === 'following' && (
                      <button
                        onClick={() => handleUnfollow(targetUser?.id, displayName)}
                        className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 text-sm"
                      >
                        Unfollow
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Modal */}
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        title="Confirm Unfollow"
        message={confirmModal.message}
      />
    </div>
  );
}

