'use client';

import { useForm } from 'react-hook-form';

interface WorkExperienceFormData {
  company: string;
  position: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface WorkExperienceFormProps {
  onSubmit: (data: WorkExperienceFormData) => void;
  onCancel: () => void;
  initialData?: WorkExperienceFormData;
}

export default function WorkExperienceForm({ onSubmit, onCancel, initialData }: WorkExperienceFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<WorkExperienceFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">Company *</label>
        <input
          {...register('company', { required: 'Company is required' })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Position *</label>
        <input
          {...register('position', { required: 'Position is required' })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Start Date</label>
          <input
            {...register('startDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">End Date</label>
          <input
            {...register('endDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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


