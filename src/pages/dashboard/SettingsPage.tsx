import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../hooks/use-toast';
import { AnimatedPage } from '../../components/common/AnimatedPage';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { User, Lock, Upload, KeyRound, Check } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
  const { teacher, setTeacher } = useAuthStore();
  const { toast } = useToast();

  const [name, setName] = useState(teacher?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(teacher?.avatarUrl || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingProfile(true);
    try {
      const updated = await authApi.updateProfile({ name: name.trim(), avatarUrl });
      setTeacher(updated);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Avatar image must be under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      // 1. Get Presigned Upload URL
      const { uploadUrl, s3Key } = await authApi.getAvatarUploadUrl(file.name, file.type);

      // 2. Direct PUT request to S3 (no Bearer token)
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // 3. Update local state
      // Since s3Key is returned, some backends use the key directly or construct a public URL.
      // We'll update the profile with the s3Key so the backend stores the reference.
      setAvatarUrl(s3Key);
      
      // Let's also save it immediately to backend profile
      const updated = await authApi.updateProfile({ name: name || teacher?.name, avatarUrl: s3Key });
      setTeacher(updated);

      toast({
        title: 'Avatar Uploaded',
        description: 'Your profile picture has been updated.',
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload avatar image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({
        title: 'Change Failed',
        description: err.response?.data?.message || 'Incorrect old password or request error.',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your teacher profile and security configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00bcd4]/5 rounded-bl-full pointer-events-none"></div>
            
            {/* Avatar upload display */}
            <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-28 h-28 border-4 border-slate-50 shadow-md">
                {teacher?.avatarUrl ? (
                  <AvatarImage src={teacher.avatarUrl} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-brand text-white text-3xl font-extrabold">
                  {teacher?.name?.charAt(0).toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Upload className="w-6 h-6 text-white" />
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#00bcd4] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-1">{teacher?.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{teacher?.email}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 hover:text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Photo
            </button>
            <p className="text-[10px] text-slate-400 mt-4 leading-normal">
              Supported formats: JPG, PNG, WEBP. Max size: 5MB.
            </p>
          </div>
        </div>

        {/* Right Side: Inputs Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 md:p-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-[#00bcd4]/10 text-[#00bcd4] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-base leading-snug">Personal Information</h2>
                <p className="text-xs text-muted-foreground">Update your public profile name.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="settings-name">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 bg-[#f7f9fb] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00bcd4]/20 focus:border-[#00bcd4] transition-all outline-none text-sm font-medium"
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-3 bg-gradient-brand hover:brightness-110 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Security / Password form */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 md:p-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-base leading-snug">Security & Password</h2>
                <p className="text-xs text-muted-foreground">Change your password to keep your account secure.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="oldPassword">
                    Current Password
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#f7f9fb] border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-sm font-medium"
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#f7f9fb] border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-sm font-medium"
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-[#f7f9fb] border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-sm font-medium"
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  {changingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
