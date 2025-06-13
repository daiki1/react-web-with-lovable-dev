
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft } from 'lucide-react';

import { authAPI } from '../../api/auth';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useToast } from '../../hooks/use-toast';

interface ForgotPasswordForm {
  email: string;
}

/**
 * Forgot password page component
 * Sends password reset code to user's email
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    
    try {
      await authAPI.forgotPassword(data);
      toast({
        title: t('common.success'),
        description: t('auth.passwordResetSent'),
        variant: 'default',
      });
      
      // Navigate to reset password page with email
      navigate('/reset-password', { state: { email: data.email } });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('common.error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.forgotPassword')}
            </h1>
            <p className="text-gray-600">
              {t('auth.forgotPasswordInstructions')}
            </p>
          </div>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label={t('auth.email')}
              type="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email', {
                required: t('validation.required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('validation.invalidEmail'),
                },
              })}
            />

            <CustomButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {t('auth.requestCode')}
            </CustomButton>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('back.toLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
