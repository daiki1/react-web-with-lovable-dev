
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X } from 'lucide-react';
import api from '../api/config';
import CustomButton from './CustomButton';
import InputField from './InputField';
import { useToast } from '../hooks/use-toast';

interface User {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserEditFormProps {
  user: User;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onClose, onUserUpdated }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { username?: string; email?: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = t('userForm.errors.usernameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('userForm.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('userForm.errors.invalidEmail');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(`/api/users/${user.userId}`, {
        username: formData.username,
        email: formData.email,
      });

      const updatedUser = { ...user, ...formData };
      onUserUpdated(updatedUser);
      
      toast({
        title: t('common.success'),
        description: t('userForm.success.update'),
        variant: 'default',
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('userForm.failure.update'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder={t('ui.enterUsername')}
          disabled={isLoading}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder={t('userForm.placeholder.email')}
          disabled={isLoading}
        />

        <div className="flex items-center justify-end space-x-3 pt-4">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </CustomButton>
          
          <CustomButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            icon={<Save className="h-4 w-4" />}
          >
            {isLoading ? t('userForm.buttons.saving') : t('userForm.buttons.save')}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default UserEditForm;
