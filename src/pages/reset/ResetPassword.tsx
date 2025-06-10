
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowLeft } from 'lucide-react';

import { authAPI } from '../../api/auth';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useToast } from '../../hooks/use-toast';

interface ResetPasswordForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Reset password page component
 * Allows user to reset password using the received code
 */
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    
    try {
      await authAPI.resetPassword({
        code: data.code,
        newPassword: data.newPassword,
        email,
      });
      
      toast({
        title: t('common.success'),
        description: t('auth.passwordResetSuccess'),
        variant: 'default',
      });
      
      navigate('/login');
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

  // Redirect to forgot password if no email
  React.useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

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
              {t('auth.resetPassword')}
            </h1>
            <p className="text-gray-600">
              {t('auth.enterResetCode')}
            </p>
            {email && (
              <p className="text-sm text-orange-600 mt-2">
                Sent to: {email}
              </p>
            )}
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label={t('auth.resetCode')}
              type="text"
              placeholder="12345"
              maxLength={5}
              error={errors.code?.message}
              {...register('code', {
                required: t('validation.required'),
                pattern: {
                  value: /^\d{5}$/,
                  message: 'Please enter a valid 5-digit code',
                },
              })}
            />

            <InputField
              label={t('auth.newPassword')}
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: t('validation.required'),
                minLength: {
                  value: 6,
                  message: t('validation.minLength', { count: 6 }),
                },
              })}
            />

            <InputField
              label={t('auth.repeatPassword')}
              type="password"
              icon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: t('validation.required'),
                validate: (value) =>
                  value === newPassword || t('validation.passwordMismatch'),
              })}
            />

            <CustomButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {t('auth.resetPassword')}
            </CustomButton>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <Link
              to="/forgot-password"
              className="block text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
            >
              Didn't receive the code? Request a new one
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.back')} to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
