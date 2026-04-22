import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabaseClient';
import { Save, ArrowLeft, User, BookOpen, Sparkles, Camera, Loader2 } from 'lucide-react';

export default function EditProfile() {
    const { user } = useAuth();
    const nav = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        branch: '',
        graduation_year: '',
        company: '',
        linkedin: '',
        bio: '',
        skills: '',
        interests: '',
        career_goals: '',
        avatar_url: '',
    });

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const data = await profileService.getProfile(user.id);
                if (mounted && data) {
                    setFormData({
                        full_name: data.full_name || '',
                        branch: data.branch || '',
                        graduation_year: data.graduation_year || '',
                        company: data.company || '',
                        linkedin: data.linkedin || '',
                        bio: data.bio || '',
                        skills: data.skills || '',
                        interests: data.interests || '',
                        career_goals: data.career_goals || '',
                        avatar_url: data.avatar_url || '',
                    });
                }
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setToastMessage(null);

        try {
            const updates = {
                full_name: formData.full_name,
                branch: formData.branch,
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
                company: formData.company,
                linkedin: formData.linkedin,
                bio: formData.bio,
                skills: formData.skills,
                interests: formData.interests,
                career_goals: formData.career_goals,
            };

            await profileService.updateProfile(user.id, updates);

            setToastMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => {
                nav('/dashboard');
            }, 1500);
        } catch (err) {
            console.error(err);
            setToastMessage({ type: 'error', text: 'Failed to update profile. Try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        try {
            setUploadingAvatar(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;
        
            const { error: uploadError } = await supabase.storage
                .from('message_attachments')
                .upload(fileName, file);
                
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from('message_attachments')
                .getPublicUrl(fileName);
                
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);
                
            if (updateError) throw updateError;
            
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            setToastMessage({ type: 'success', text: 'Profile picture updated!' });
            
        } catch (err) {
            console.error('Failed to upload avatar', err);
            setToastMessage({ type: 'error', text: 'Failed to upload profile picture. Try again.' });
        } finally {
            setUploadingAvatar(false);
            e.target.value = null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 font-medium">Loading profile data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12 pt-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => nav('/dashboard')}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--cardinal)] text-white font-bold rounded-xl hover:bg-red-800 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Toast Notif */}
                {toastMessage && (
                    <div className={`mb-6 p-4 rounded-xl font-medium flex items-center gap-3 ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        <Sparkles className="w-5 h-5" />
                        {toastMessage.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">

                    {/* Profile Picture Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Change Profile Picture">
                            <img 
                                src={formData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.full_name || 'User')}`} 
                                alt="My Profile" 
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:brightness-75 transition-all" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/jpg" 
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
                            />
                            {uploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-500">Click to change avatar</p>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                            <User className="w-5 h-5 text-[var(--cardinal)]" />
                            <h2 className="font-bold text-lg text-slate-900">Personal Information</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
                                <input
                                    type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio / About</label>
                                <textarea
                                    name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us a little about yourself..."
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Academic Profile */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                            <BookOpen className="w-5 h-5 text-[var(--cardinal)]" />
                            <h2 className="font-bold text-lg text-slate-900">Academic & Professional Details</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department / Branch</label>
                                <input
                                    type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. CSE"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year of Study / Graduation</label>
                                <input
                                    type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="e.g. 2024"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Company (If any)</label>
                                <input
                                    type="text" name="company" value={formData.company} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills & Interests */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                            <Sparkles className="w-5 h-5 text-[var(--cardinal)]" />
                            <h2 className="font-bold text-lg text-slate-900">Skills & Interests</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Core Skills</label>
                                <input
                                    type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Python, UI/UX"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Interests / Hobbies</label>
                                <input
                                    type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g. AI, Open Source, Hiking"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Career Goals</label>
                                <textarea
                                    name="career_goals" value={formData.career_goals} onChange={handleChange} rows="2" placeholder="What roles or domain are you aiming for?"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent outline-none transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
