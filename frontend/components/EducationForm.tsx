'use client';

import { useForm } from 'react-hook-form';

interface EducationFormData {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

interface EducationFormProps {
  onSubmit: (data: EducationFormData) => void;
  onCancel: () => void;
  initialData?: EducationFormData;
}

export default function EducationForm({ onSubmit, onCancel, initialData }: EducationFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EducationFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1">Institution *</label>
        <input
          {...register('institution', { required: 'Institution is required' })}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Degree</label>
        <input
          {...register('degree')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Field</label>
        <input
          {...register('field')}
          type="text"
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


