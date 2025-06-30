"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

// --- Type Definitions ---
// Defines the structure for the form data state
interface IFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Defines the structure for the form errors, where each key is optional
type FormErrors = {
  [K in keyof IFormData]?: string;
};

// --- Component ---
export default function App() {
  // --- State Management ---
  const [formData, setFormData] = useState<IFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // --- Event Handlers ---
  /**
   * Handles changes in form input fields.
   * @param e - The React change event from the input element.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear the error for the specific field when the user starts typing
    if (errors[name as keyof IFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Calculate password strength if the password field is being changed
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  /**
   * Handles the form submission.
   * @param e - The React form event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate an API call to register the user
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    console.log('Sign up data submitted:', formData);
    // Here you would typically handle the successful sign-up,
    // like redirecting the user or showing a success message.
  };

  // --- Validation and Logic ---
  /**
   * Validates the entire form and sets error messages.
   * @returns {boolean} - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Calculates the strength of the password based on a set of criteria.
   * @param password - The password string to evaluate.
   */
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  /**
   * Determines the color for the password strength indicator.
   * @returns {string} - A Tailwind CSS background color class.
   */
  const getPasswordStrengthColor = (): string => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-yellow-500';
    if (passwordStrength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  /**
   * Gets the descriptive text for the current password strength.
   * @returns {string} - A descriptive string ('Weak', 'Fair', etc.).
   */
  const getPasswordStrengthText = (): string => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };


  // --- Render Method ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.008]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-10"></div>
        
        {/* Animated floating particles for a dynamic feel */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            animate={{
              x: [Math.random() * 100, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 100],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50">
          {/* Form Header */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-black text-gray-800 mb-2"
            >
              Create Your{" "}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Account
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-500"
            >
              Join thousands of marketers already growing with us.
            </motion.p>
          </div>

          {/* Form Element */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.firstName}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                      errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastName}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="john.doe@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full ${getPasswordStrengthColor()} transition-colors duration-300`}
                      />
                    </div>
                    <span className={`text-xs font-medium text-gray-600`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Form Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center mt-6"
          >
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors duration-300">
                Sign In
              </button>
            </p>
          </motion.div>

          {/* Terms and Conditions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center mt-4"
          >
            <p className="text-gray-500 text-xs">
              By signing up, you agree to our{" "}
              <button className="text-orange-600 hover:text-orange-700 transition-colors duration-300">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-orange-600 hover:text-orange-700 transition-colors duration-300">
                Privacy Policy
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
