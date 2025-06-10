
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Users 
} from 'lucide-react';

import api from '../../api/config';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import PopupDialog from '../../components/PopupDialog';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useToast } from '../../hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

/**
 * User management page for administrators
 * Provides CRUD operations for user accounts
 */
const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/users?page=${currentPage}&size=${pageSize}&sort=email,asc`
      );
      
      setUsers(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/users/${userId}/status`, { active: !currentStatus });
      
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, active: !currentStatus } : user
      ));
      
      toast({
        title: t('common.success'),
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await api.delete(`/api/users/${userId}`);
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      setShowDeleteDialog(false);
      setSelectedUser(null);
      
      toast({
        title: t('common.success'),
        description: t('pages.users.userDeleted'),
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRolesBadge = (roles: string[]) => {
    return roles.map(role => (
      <span
        key={role}
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 ${
          role === 'ADMIN' 
            ? 'bg-red-100 text-red-700'
            : role === 'AUDITOR'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {t(`roles.${role.toLowerCase()}`)}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <LoaderOverlay isVisible={isLoading} message={t('common.loading')} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')} to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('pages.users.title')}
              </h1>
              <p className="text-gray-600">
                Manage user accounts and permissions
              </p>
            </div>
            
            <CustomButton
              variant="primary"
              icon={<UserPlus className="h-4 w-4" />}
            >
              {t('pages.users.addUser')}
            </CustomButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <InputField
                placeholder="Search by username or email..."
                icon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{filteredUsers.length} users found</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.users.roles')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.users.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.users.createdAt')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.users.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRolesBadge(user.roles)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? t('pages.users.active') : t('pages.users.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.active)}
                          className="text-orange-600 hover:text-orange-700 transition-colors duration-200"
                          title={user.active ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.active ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-700 transition-colors duration-200"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </div>
              
              <div className="flex space-x-2">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  {t('common.previous')}
                </CustomButton>
                
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  {t('common.next')}
                </CustomButton>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <PopupDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title={t('pages.users.deleteUser')}
          actions={
            <>
              <CustomButton
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                {t('common.cancel')}
              </CustomButton>
              <CustomButton
                variant="destructive"
                onClick={() => selectedUser && deleteUser(selectedUser.id)}
              >
                {t('common.delete')}
              </CustomButton>
            </>
          }
        >
          <p className="text-gray-600">
            {t('pages.users.confirmDelete')}
          </p>
          {selectedUser && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedUser.username}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
            </div>
          )}
        </PopupDialog>
      </div>
    </div>
  );
};

export default UserManagement;
