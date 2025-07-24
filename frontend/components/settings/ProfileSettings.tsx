"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { Camera, Check, X, Loader2, AlertCircle, User, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface ProfileFormData {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  website: string;
  location: string;
  publicProfile: boolean;
  emailNotifications: boolean;
}

export function ProfileSettings() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.publicMetadata?.bio as string || "",
    website: user?.publicMetadata?.website as string || "",
    location: user?.publicMetadata?.location as string || "",
    publicProfile: user?.publicMetadata?.publicProfile as boolean || false,
    emailNotifications: user?.publicMetadata?.emailNotifications as boolean || true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageUpload(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = "Please enter a valid URL";
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      if (imageUpload) {
        await user?.setProfileImage({ file: imageUpload });
      }

      await user?.update({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      await user?.update({
        //@ts-ignore
        publicMetadata: {
          bio: formData.bio,
          website: formData.website,
          location: formData.location,
          publicProfile: formData.publicProfile,
          emailNotifications: formData.emailNotifications,
        },
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.publicMetadata?.bio as string || "",
      website: user?.publicMetadata?.website as string || "",
      location: user?.publicMetadata?.location as string || "",
      publicProfile: user?.publicMetadata?.publicProfile as boolean || false,
      emailNotifications: user?.publicMetadata?.emailNotifications as boolean || true,
    });
    setErrors({});
    setPreviewUrl("");
    setImageUpload(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className={`${poppins.className} text-2xl font-bold text-white tracking-tight`}>
          Your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
            Profile
          </span>
        </h3>
        <p className={`${inter.className} text-white/80 font-medium mt-2`}>
          This is how others will see you on the site.
        </p>
      </div>
      
      <Separator className="bg-white/10" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture */}
        <div className="space-y-4">
          <Label className={`${inter.className} text-white font-semibold text-base`}>Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-orange-500/30">
              <AvatarImage 
                src={previewUrl || user?.imageUrl} 
                alt="Profile picture" 
              />
              <AvatarFallback className="bg-gradient-to-br from-orange-600 to-orange-700 text-white text-lg font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label 
                htmlFor="avatar-upload" 
                className={`${inter.className} cursor-pointer inline-flex items-center gap-2 text-sm bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200`}
              >
                <Camera size={16} />
                Change Photo
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className={`${inter.className} text-white/60 text-sm`}>
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}>
            <Settings className="text-orange-500" size={18} />
            Basic Information
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="First Name *"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <FormField
            label="Username *"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
          />

          <div className="space-y-2">
            <Label className={`${inter.className} text-white font-semibold`}>Email Address</Label>
            <Input
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="border-white/20 bg-white/5 text-white/70 disabled:opacity-50"
            />
            <p className={`${inter.className} text-white/60 text-sm`}>
              Email cannot be changed here. Use your account settings.
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}>
            <User className="text-orange-500" size={18} />
            Additional Information
          </h4>
          
          <div className="space-y-2">
            <Label className={`${inter.className} text-white font-semibold`}>Bio</Label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us a bit about yourself..."
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40 min-h-[80px] focus:border-orange-500/50 focus:ring-orange-500/20"
            />
            <div className={`${inter.className} flex justify-between text-sm`}>
              <span className="text-white/60">{formData.bio.length}/500 characters</span>
              {errors.bio && (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.bio}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
              error={errors.website}
            />
            <FormField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h4 className={`${poppins.className} text-lg font-semibold text-white flex items-center gap-2`}>
            <Shield className="text-orange-500" size={18} />
            Privacy & Notifications
          </h4>
          
          <div className="space-y-4">
            <SettingToggle
              title="Public Profile"
              description="Make your profile visible to other users"
              checked={formData.publicProfile}
              onChange={(checked) => handleSwitchChange('publicProfile', checked)}
            />
            <SettingToggle
              title="Email Notifications"
              description="Receive email updates and notifications"
              checked={formData.emailNotifications}
              onChange={(checked) => handleSwitchChange('emailNotifications', checked)}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className={`${inter.className} bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border-none font-semibold transition-all duration-200 disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className={`${inter.className} border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-semibold transition-all duration-200`}
            onClick={handleReset}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}

// Helper Components
function FormField({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  error 
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className={`${inter.className} text-white font-semibold`}>{label}</Label>
      <Input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20"
      />
      {error && (
        <p className={`${inter.className} text-red-400 text-sm flex items-center gap-1`}>
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

function SettingToggle({ 
  title, 
  description, 
  checked, 
  onChange 
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="space-y-1">
        <Label className={`${inter.className} text-white font-semibold`}>{title}</Label>
        <p className={`${inter.className} text-white/60 text-sm`}>{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-orange-500"
      />
    </div>
  );
}
