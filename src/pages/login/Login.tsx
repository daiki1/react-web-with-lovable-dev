
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Globe } from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import Dropdown from '../../components/Dropdown';
import LoaderOverlay from '../../components/LoaderOverlay';

interface LoginForm {
  username: string;
  password: string;
}

/**
 * Login page component with multilingual support
 * Handles user authentication and language selection
 */
const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const languageOptions = [
    { value: 'en', label: t('languages.en') },
    { value: 'es', label: t('languages.es') },
  ];

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  const onSubmit = async (data: LoginForm) => {
    const success = await login(data.username, data.password);
    if (success) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <LoaderOverlay isVisible={isLoading} message={t('common.loading')} />
      
      <div className="w-full max-w-md">
        <div className="card-container animate-slide-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.login')}
            </h1>
            <p className="text-gray-600">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {/* Language Selector */}
          <div className="mb-6">
            <Dropdown
              label={t('navigation.changeLanguage')}
              options={languageOptions}
              value={selectedLanguage}
              onSelect={handleLanguageChange}
              icon={<Globe className="h-4 w-4" />}
            />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label={t('auth.username')}
              type="text"
              icon={<Mail className="h-4 w-4" />}
              error={errors.username?.message}
              {...register('username', {
                required: t('validation.required'),
              })}
            />

            <InputField
              label={t('auth.password')}
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password', {
                required: t('validation.required'),
              })}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <CustomButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {t('auth.login')}
            </CustomButton>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3 text-center">
            <Link
              to="/forgot-password"
              className="block text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
            >
              {t('auth.forgotPassword')}
            </Link>
            
            <div className="text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link
                to="/register"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                {t('auth.register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
