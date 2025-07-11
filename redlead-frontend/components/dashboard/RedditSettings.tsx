"use client";
import React, { useState, useEffect } from 'react';
import { ExternalLink, Check,  AlertCircle, User } from 'lucide-react';
import { api } from '@/lib/api';

interface RedditConnectionProps {
  userId: string;
  onConnectionChange?: (connected: boolean) => void;
}

export const RedditConnection = ({ userId, onConnectionChange }: RedditConnectionProps) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data to check Reddit connection status
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await api.getUser(userId);
      setUser(userData);
      onConnectionChange?.(!!userData.redditRefreshToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect Reddit account
  const connectReddit = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Get Reddit OAuth URL
      const response = await api.getRedditAuthUrl(userId);
      
      // Redirect to Reddit OAuth
      window.location.href = response.authUrl;
    } catch (err: any) {
      setError(err.message);
      setIsConnecting(false);
    }
  };

  // Disconnect Reddit account
  const disconnectReddit = async () => {
    try {
      setIsLoading(true);
      await api.disconnectReddit(userId);
      await fetchUser(); // Refresh user data
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-[#343536] rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-[#343536] rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-[#343536] rounded w-32"></div>
        </div>
      </div>
    );
  }

  const isConnected = !!user?.redditRefreshToken;

  return (
    <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isConnected ? 'bg-green-500/10' : 'bg-gray-500/10'
          }`}>
            {isConnected ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">Reddit Account</h3>
            <p className="text-sm text-gray-400">
              {isConnected 
                ? `Connected as u/${user.redditUsername}`
                : 'Connect your Reddit account to post replies'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="text-xs text-gray-400">
              {user.redditKarma} karma
            </span>
          )}
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#272729] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Username:</span>
              <span className="text-sm font-medium text-white">u/{user.redditUsername}</span>
            </div>
            <a
              href={`https://reddit.com/u/${user.redditUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff4500] hover:text-[#ff6b35] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-[#272729] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Karma:</span>
              <span className="text-sm font-medium text-white">{user.redditKarma?.toLocaleString()}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              (user.redditKarma || 0) >= 10 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {(user.redditKarma || 0) >= 10 ? 'Verified' : 'Low karma'}
            </span>
          </div>

          <button
            onClick={disconnectReddit}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Disconnect Reddit Account
          </button>
        </div>
      ) : (
        <button
          onClick={connectReddit}
          disabled={isConnecting}
          className="w-full px-4 py-2 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Connect Reddit Account
            </>
          )}
        </button>
      )}

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400">
            <strong>Why connect?</strong> You need a Reddit account to post replies. 
            We use your account to authenticate with Reddit's API securely.
          </p>
        </div>
      )}
    </div>
  );
};