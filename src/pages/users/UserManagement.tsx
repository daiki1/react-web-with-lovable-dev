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
  Users,
  UserCheck
} from 'lucide-react';

import api from '../../api/config';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import PopupDialog from '../../components/PopupDialog';
import UserEditForm from '../../components/UserEditForm';
import UserRoleForm from '../../components/UserRoleForm';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useToast } from '../../hooks/use-toast';

interface User {
  userId: number;
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  
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
        description: error.response?.data?.message || t('pages.users.loadError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number | undefined, currentStatus: boolean) => {
    if (typeof userId !== 'number') {
      console.error('Invalid userId:', userId);
      toast({
        title: t('common.error'),
        description: t('pages.users.invalidId'),
        variant: 'destructive',
      });
      return;
    }
    try {
      await api.patch(`/api/users/${userId}/status`, { active: !currentStatus });
      
      setUsers(prev => prev.map(user =>
        user.userId === userId ? { ...user, active: !currentStatus } : user
      ));
      
      toast({
        title: t('common.success'),
        description: t('pages.users.statusUpdated', {
          status: !currentStatus ? t('common.activated') : t('common.deactivated')
        }),
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('pages.users.loadError'),
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await api.delete(`/api/users/${userId}`);
      
      setUsers(prev => prev.filter(user => user.userId !== userId));
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
        description: error.response?.data?.message || t('pages.users.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleRoleClick = (user: User) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user =>
      user.userId === updatedUser.userId ? updatedUser : user
    ));
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
          role === 'ROLE_ADMIN' 
            ? 'bg-red-100 text-red-700'
            : role === 'ROLE_AUDITOR'
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
            {t('back.toHome')}
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('pages.users.title')}
              </h1>
              <p className="text-gray-600">
                 {t('pages.users.description')}
              </p>
            </div>
            
            {/*<CustomButton
              variant="primary"
              icon={<UserPlus className="h-4 w-4" />}
            >
              {t('pages.users.addUser')}
            </CustomButton>*/}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <InputField
                placeholder={t('pages.users.searchPlaceholder')}
                icon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{t('pages.users.usersFound', { count: filteredUsers.length })}</span>
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
                    {t('pages.users.userColumn')}
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
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors duration-150">
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
                          onClick={() => toggleUserStatus(user.userId, user.active)}
                          className={`transition-colors duration-200 ${
                            user.active
                              ? 'text-orange-600 hover:text-orange-700'
                              : 'text-gray-400 hover:text-gray-500'
                          }`}
                          title={t(user.active ? 'pages.users.deactivateTitle' : 'pages.users.activateTitle')}
                        >
                          {user.active ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                          title={t('pages.users.editTitle')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleRoleClick(user)}
                          className="text-purple-600 hover:text-purple-700 transition-colors duration-200"
                          title={t('pages.users.roleTitle')}
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        
                        {/*<button
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-600 hover:text-red-700 transition-colors duration-200"
                          title="Delete user"
                         >
                          <Trash2 className="h-4 w-4" />
                        </button>*/}
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
              <div>{t('pages.users.pagination', { current: currentPage + 1, total: totalPages })}</div>

              
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

        {/* Edit User Dialog */}
        <PopupDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          size="md"
          showCloseButton={false}
        >
          {selectedUser && (
            <UserEditForm
              user={selectedUser}
              onClose={() => setShowEditDialog(false)}
              onUserUpdated={handleUserUpdated}
            />
          )}
        </PopupDialog>

        {/* Role Management Dialog */}
        <PopupDialog
          isOpen={showRoleDialog}
          onClose={() => setShowRoleDialog(false)}
          size="md"
          showCloseButton={false}
        >
          {selectedUser && (
            <UserRoleForm
              user={selectedUser}
              onClose={() => setShowRoleDialog(false)}
              onRolesUpdated={handleUserUpdated}
            />
          )}
        </PopupDialog>

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
                onClick={() => selectedUser && deleteUser(selectedUser.userId)}
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
