'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profiles/${profileId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await api.get(`/profiles/${profileId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${profileId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (loading) return <div className="p-8 bg-white text-black">Loading...</div>;
  if (!profile) return <div className="p-8 bg-white text-black">Profile not found</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-200 rounded-lg shadow p-8">
        <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">{profile.name}</h1>
            {profile.user?.email && <p className="text-black">{profile.user.email}</p>}
          </div>
          <button
            onClick={downloadPdf}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md"
          >
            📄 Download Resume PDF
          </button>
        </div>
        {profile.bio && <p className="text-black mb-4">{profile.bio}</p>}
        {profile.contactInfo && <p className="text-black mb-4">{profile.contactInfo}</p>}
        
        {profile.education && profile.education.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Education</h2>
            {profile.education.map((edu: any) => (
              <div key={edu.id} className="mb-4">
                <h3 className="font-semibold text-black">{edu.institution}</h3>
                {edu.degree && <p className="text-black">{edu.degree}{edu.field && ` in ${edu.field}`}</p>}
              </div>
            ))}
          </section>
        )}

        {profile.workExperience && profile.workExperience.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Work Experience</h2>
            {profile.workExperience.map((work: any) => (
              <div key={work.id} className="mb-4">
                <h3 className="font-semibold text-black">{work.company}</h3>
                <p className="text-black">{work.position}</p>
                {work.description && <p className="text-black">{work.description}</p>}
              </div>
            ))}
          </section>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: any) => (
                <span key={skill.id} className="px-3 py-1 bg-gray-200 text-black rounded">
                  {skill.name}{skill.level && ` (${skill.level})`}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

