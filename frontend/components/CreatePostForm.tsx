'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(1000, 'Post must be less than 1000 characters'),
});

type PostFormData = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onSubmit: (data: PostFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CreatePostForm({ onSubmit, onCancel }: CreatePostFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleFormSubmit = async (data: PostFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">What's on your mind?</label>
        <textarea
          {...register('content')}
          rows={4}
          placeholder="Share your thoughts..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}


