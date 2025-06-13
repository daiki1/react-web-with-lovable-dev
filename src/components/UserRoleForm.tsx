
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, UserCheck } from 'lucide-react';
import api from '../api/config';
import CustomButton from './CustomButton';
import { useToast } from '../hooks/use-toast';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserRoleFormProps {
  user: User;
  onClose: () => void;
  onRolesUpdated: (updatedUser: User) => void;
}

const UserRoleForm: React.FC<UserRoleFormProps> = ({ user, onClose, onRolesUpdated }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    loadAvailableRoles();
  }, []);

  const loadAvailableRoles = async () => {
    try {
      const response = await api.get('/api/users/roles');
      setAvailableRoles(response.data);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to load roles',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        // Don't allow removing the last role
        if (prev.length === 1) {
          toast({
            title: t('common.error'),
            description: 'User must have at least one role',
            variant: 'destructive',
          });
          return prev;
        }
        return prev.filter(role => role !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRoles.length === 0) {
      toast({
        title: t('common.error'),
        description: 'User must have at least one role',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/api/users/${user.userId}/roles`, {
        roles: selectedRoles,
      });

      const updatedUser = { ...user, roles: selectedRoles };
      onRolesUpdated(updatedUser);
      
      toast({
        title: t('common.success'),
        description: 'User roles updated successfully',
        variant: 'default',
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to update user roles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRoles) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Change User Roles</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <UserCheck className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-medium text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Roles (at least one required)
          </label>
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => handleRoleToggle(role.name)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`role-${role.id}`} className="block text-sm font-medium text-gray-900 cursor-pointer">
                    {role.name}
                  </label>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
            disabled={isLoading || selectedRoles.length === 0}
            icon={<Save className="h-4 w-4" />}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default UserRoleForm;
