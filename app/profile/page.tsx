'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/models/user';
import { useToast, ToastContainer } from '@/components/Toast';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/profile?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          avatar: data.profile.avatar || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // Update name in Firestore
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          name: formData.name,
          avatar: formData.avatar,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
        await fetchProfile();
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, formData.newPassword);

      toast.success('Password changed successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-white dark:from-slate-900 dark:to-slate-950">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {/* Header */}
      <header className="bg-white/30 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-800/80">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <img 
                  src="/images/logo.png" 
                  alt="Icareerly Logo" 
                  width={48} 
                  height={48} 
                  className="cursor-pointer"
                />
              </Link>
              <span className="text-2xl font-extralight tracking-wide text-white font-concretica">
                icareerly
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extralight text-white mb-2 font-concretica">
            Profile Settings
          </h1>
          <p className="text-white/90 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-6 font-concretica">
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Avatar URL (Optional)
                </label>
                <input
                  type="url"
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Enter a URL to your profile picture</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-extralight text-gray-800 dark:text-slate-100 mb-6 font-concretica">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your new password (min. 8 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="Confirm your new password"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

