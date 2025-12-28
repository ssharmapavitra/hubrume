'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import EducationForm from '@/components/EducationForm';
import WorkExperienceForm from '@/components/WorkExperienceForm';
import SkillForm from '@/components/SkillForm';

export default function EditProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const hasHydrated = useAuthHydration();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [education, setEducation] = useState<any[]>([]);
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  
  // Modal states
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [messageModal, setMessageModal] = useState({ show: false, message: '', isError: false });

  useEffect(() => {
    if (!hasHydrated) return; // Wait for hydration
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, hasHydrated, router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      setProfile(response.data);
      setEducation(response.data.education || []);
      setWorkExperience(response.data.workExperience || []);
      setSkills(response.data.skills || []);
      if (response.data) {
        setValue('name', response.data.name || '');
        setValue('bio', response.data.bio || '');
        setValue('contactInfo', response.data.contactInfo || '');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        console.error('Failed to fetch profile:', error);
        showMessage('Failed to fetch profile', true);
      }
    } finally {
      setLoading(false);
    }
  };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      bio: '',
      contactInfo: '',
    },
  });

  const showMessage = (message: string, isError: boolean = false) => {
    setMessageModal({ show: true, message, isError });
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      if (profile) {
        await api.put('/profiles/me', data);
      } else {
        await api.post('/profiles', data);
        await fetchProfile();
      }
      showMessage('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      showMessage('Failed to save profile', true);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (data: any) => {
    try {
      const response = await api.post('/profiles/me/education', data);
      setEducation([...education, response.data]);
      setShowEducationModal(false);
      showMessage('Education added successfully!');
    } catch (error) {
      console.error('Failed to add education:', error);
      showMessage('Failed to add education', true);
    }
  };

  const handleRemoveEducation = (id: string) => {
    setConfirmMessage('Are you sure you want to remove this education entry?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/profiles/me/education/${id}`);
        setEducation(education.filter((e) => e.id !== id));
        showMessage('Education removed successfully!');
      } catch (error) {
        console.error('Failed to remove education:', error);
        showMessage('Failed to remove education', true);
      }
    });
    setShowConfirmModal(true);
  };

  const handleAddWorkExperience = async (data: any) => {
    try {
      const response = await api.post('/profiles/me/work-experience', data);
      setWorkExperience([...workExperience, response.data]);
      setShowWorkModal(false);
      showMessage('Work experience added successfully!');
    } catch (error) {
      console.error('Failed to add work experience:', error);
      showMessage('Failed to add work experience', true);
    }
  };

  const handleRemoveWorkExperience = (id: string) => {
    setConfirmMessage('Are you sure you want to remove this work experience?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/profiles/me/work-experience/${id}`);
        setWorkExperience(workExperience.filter((w) => w.id !== id));
        showMessage('Work experience removed successfully!');
      } catch (error) {
        console.error('Failed to remove work experience:', error);
        showMessage('Failed to remove work experience', true);
      }
    });
    setShowConfirmModal(true);
  };

  const handleAddSkill = async (data: any) => {
    try {
      const response = await api.post('/profiles/me/skills', data);
      setSkills([...skills, response.data]);
      setShowSkillModal(false);
      showMessage('Skill added successfully!');
    } catch (error) {
      console.error('Failed to add skill:', error);
      showMessage('Failed to add skill', true);
    }
  };

  const handleRemoveSkill = (id: string) => {
    setConfirmMessage('Are you sure you want to remove this skill?');
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/profiles/me/skills/${id}`);
        setSkills(skills.filter((s) => s.id !== id));
        showMessage('Skill removed successfully!');
      } catch (error) {
        console.error('Failed to remove skill:', error);
        showMessage('Failed to remove skill', true);
      }
    });
    setShowConfirmModal(true);
  };

  if (loading) return <div className="p-8 bg-white text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">
          {profile ? 'Edit Resume Profile' : 'Create Resume Profile'}
        </h1>

        {/* Basic Info */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-black mb-4">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Contact Info</label>
            <input
              {...register('contactInfo')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Basic Info'}
          </button>
        </form>

        {/* Education */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Education</h2>
            <button
              onClick={() => setShowEducationModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + Add Education
            </button>
          </div>
          {education.length === 0 ? (
            <p className="text-black">No education entries. Click "Add Education" to add one.</p>
          ) : (
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="bg-white border border-gray-200 rounded p-4 flex justify-between">
                  <div>
                    <h3 className="font-semibold text-black">{edu.institution}</h3>
                    {edu.degree && <p className="text-black">{edu.degree}{edu.field && ` in ${edu.field}`}</p>}
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-sm text-gray-600">
                        {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : 'N/A'} -{' '}
                        {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Experience */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Work Experience</h2>
            <button
              onClick={() => setShowWorkModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + Add Work Experience
            </button>
          </div>
          {workExperience.length === 0 ? (
            <p className="text-black">No work experience entries. Click "Add Work Experience" to add one.</p>
          ) : (
            <div className="space-y-3">
              {workExperience.map((work) => (
                <div key={work.id} className="bg-white border border-gray-200 rounded p-4 flex justify-between">
                  <div>
                    <h3 className="font-semibold text-black">{work.company}</h3>
                    <p className="text-black">{work.position}</p>
                    {work.description && <p className="text-black mt-1">{work.description}</p>}
                    {(work.startDate || work.endDate) && (
                      <p className="text-sm text-gray-600">
                        {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'N/A'} -{' '}
                        {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveWorkExperience(work.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Skills</h2>
            <button
              onClick={() => setShowSkillModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + Add Skill
            </button>
          </div>
          {skills.length === 0 ? (
            <p className="text-black">No skills. Click "Add Skill" to add one.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-white border border-gray-200 rounded px-3 py-1 flex items-center gap-2">
                  <span className="text-black">{skill.name}{skill.level && ` (${skill.level})`}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {profile && (
          <div className="text-center">
            <a
              href={`/profile/${profile.id}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View My Resume
            </a>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        title="Add Education"
      >
        <EducationForm
          onSubmit={handleAddEducation}
          onCancel={() => setShowEducationModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showWorkModal}
        onClose={() => setShowWorkModal(false)}
        title="Add Work Experience"
      >
        <WorkExperienceForm
          onSubmit={handleAddWorkExperience}
          onCancel={() => setShowWorkModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        title="Add Skill"
      >
        <SkillForm
          onSubmit={handleAddSkill}
          onCancel={() => setShowSkillModal(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        title="Confirm Action"
        message={confirmMessage}
      />

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
