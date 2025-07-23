"use client";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

//================================================================//
//          New Email Settings Component                          //
//================================================================//
const EmailSettings = () => {
  const { getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = await getToken();
      try {
        const settings = await api.getEmailSettings(token);
        if (settings) {
          setEmail(settings.email);
          setEnabled(settings.enabled);
        }
      } catch (error) {
        console.error('Failed to fetch email settings:', error);
        setMessage({ text: 'Failed to load settings.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [getToken]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    const token = await getToken();
    try {
      await api.updateEmailSettings({ email, enabled }, token);
      showMessage('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save email settings:', error);
      showMessage('Failed to save settings.', 'error');
    }
  };

  const handleSendTest = async () => {
    const token = await getToken();
    try {
      await api.sendTestEmail(token);
      showMessage('Test email sent!', 'success');
    } catch (error) {
      console.error('Failed to send test email:', error);
      showMessage('Failed to send test email.', 'error');
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading settings...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="email-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <label htmlFor="email-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Enable Email Notifications
          </label>
        </div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!enabled}
          className="max-w-sm"
        />
        <div className="flex space-x-2">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button onClick={handleSendTest} disabled={!enabled} variant="outline">Send Test Email</Button>
        </div>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
};


//================================================================//
//          Your Existing Danger Zone Component                   //
//================================================================//
const DangerZone = () => {
  const { getToken, signOut } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await api.deleteCurrentUser(token);
      await signOut(() => window.location.replace("/"));
    } catch (error) {
      console.error("Failed to delete account", error);
      alert("Failed to delete account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
      <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
      <p className="text-gray-400 text-sm mt-2">
        Deleting your account is permanent and cannot be undone. All of your campaigns, leads, and data will be permanently removed.
      </p>
      <button
        onClick={() => setShowConfirm(true)}
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      >
        Delete My Account
      </button>

      {showConfirm && (
        <div className="mt-4 space-y-4">
          <p className="text-white">Are you sure? This action is irreversible.</p>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Yes, Delete My Account Permanently"}
          </button>
          <button onClick={() => setShowConfirm(false)} className="w-full text-center text-gray-400 hover:text-white text-sm">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};


//================================================================//
//          Main Page Component for /settings                     //
//================================================================//
export default function SettingsPage() {
    return (
      <div className="p-4 sm:p-8 space-y-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <EmailSettings />
        <DangerZone />
      </div>
    );
  }