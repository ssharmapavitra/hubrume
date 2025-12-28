'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import Modal from '@/components/Modal';
import CreatePostForm from '@/components/CreatePostForm';

export default function FeedPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHydration();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [messageModal, setMessageModal] = useState({ show: false, message: '', isError: false });

  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchFeed();
  }, [isAuthenticated, hasHydrated, router]);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string, isError: boolean = false) => {
    setMessageModal({ show: true, message, isError });
  };

  const handleCreatePost = async (data: { content: string }) => {
    try {
      await api.post('/posts', data);
      setShowCreatePostModal(false);
      showMessage('Post created successfully!');
      // Refresh the feed
      await fetchFeed();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      showMessage(error.response?.data?.message || 'Failed to create post', true);
    }
  };

  if (loading) return <div className="p-8 bg-white text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Feed</h1>
          <button
            onClick={() => setShowCreatePostModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
            <p className="text-black mb-4">No posts yet. Follow users to see their posts!</p>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <div className="mb-2">
                  <span className="font-semibold text-black">{post.author.profile?.name || post.author.email}</span>
                </div>
                <p className="text-black whitespace-pre-wrap">{post.content}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        title="Create Post"
      >
        <CreatePostForm
          onSubmit={handleCreatePost}
          onCancel={() => setShowCreatePostModal(false)}
        />
      </Modal>

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
    </div>
  );
}

