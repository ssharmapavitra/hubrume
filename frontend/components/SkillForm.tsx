'use client';

import { useForm } from 'react-hook-form';

interface SkillFormData {
  name: string;
  level?: string;
}

interface SkillFormProps {
  onSubmit: (data: SkillFormData) => void;
  onCancel: () => void;
  initialData?: SkillFormData;
}

export default function SkillForm({ onSubmit, onCancel, initialData }: SkillFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SkillFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">Skill Name *</label>
        <input
          {...register('name', { required: 'Skill name is required' })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Level</label>
        <select
          {...register('level')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}


