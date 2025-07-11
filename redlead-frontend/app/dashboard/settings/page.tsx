import { RedditConnection } from '@/components/dashboard/RedditSettings'; // If you move it to its own file


// Example usage inside your settings page component
export default function SettingsPage() {
    const TEST_USER_ID = 'clerk_test_user_123'; // Replace with your actual user ID logic
  
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Settings</h1>
        <RedditConnection userId={TEST_USER_ID} />
        {/* Add other settings sections here */}
      </div>
    );
  }