import { useState, useEffect, useRef } from 'react';
import { Save, Upload, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    professional_title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    facebook_url: '',
    profile_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          professional_title: data.professional_title || '',
          bio: data.bio || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          linkedin_url: data.linkedin_url || '',
          facebook_url: data.facebook_url || '',
          profile_image: data.profile_image || '',
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file);

    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(fileName);
    setFormData((f) => ({ ...f, profile_image: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    if (profile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          professional_title: formData.professional_title || null,
          bio: formData.bio || null,
          email: formData.email || null,
          phone: formData.phone || null,
          location: formData.location || null,
          linkedin_url: formData.linkedin_url || null,
          facebook_url: formData.facebook_url || null,
          profile_image: formData.profile_image || null,
        })
        .eq('id', profile.id);

      if (updateError) {
        setError('Failed to update profile: ' + updateError.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } else {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          full_name: formData.full_name,
          professional_title: formData.professional_title || null,
          bio: formData.bio || null,
          email: formData.email || null,
          phone: formData.phone || null,
          location: formData.location || null,
          linkedin_url: formData.linkedin_url || null,
          facebook_url: formData.facebook_url || null,
          profile_image: formData.profile_image || null,
        });

      if (insertError) {
        setError('Failed to create profile: ' + insertError.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-navy-400">Loading profile...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-1">Profile</h1>
        <p className="text-sm text-navy-500">Manage your professional profile information</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg mb-6">
          <CheckCircle2 className="text-teal-600 flex-shrink-0" size={20} />
          <p className="text-sm text-teal-700">Profile saved successfully</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6">
        {/* Profile Image */}
        <div className="card p-5">
          <label className="label-field">Profile Photo</label>
          {formData.profile_image ? (
            <div className="relative group">
              <img
                src={formData.profile_image}
                alt="Profile"
                className="w-full aspect-square object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, profile_image: '' })}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-red-600 text-xs">Remove</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-square border-2 border-dashed border-navy-200 rounded-xl flex flex-col items-center justify-center gap-2 text-navy-400 hover:border-navy-400 hover:text-navy-600 transition-colors"
            >
              <User size={32} />
              <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Photo'}</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Form fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="label-field">Professional Title</label>
                <input
                  type="text"
                  value={formData.professional_title}
                  onChange={(e) => setFormData({ ...formData, professional_title: e.target.value })}
                  className="input-field"
                  placeholder="Chartered Accountant"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="input-field resize-none"
                placeholder="Your professional bio..."
              />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-navy-900">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="label-field">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="Nepal"
              />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-navy-900">Social Links</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="input-field"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="label-field">Facebook URL</label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="input-field"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
