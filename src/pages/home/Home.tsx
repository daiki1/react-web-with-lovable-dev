
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  LogOut, 
  TestTube, 
  Users, 
  FileText, 
  MapPin,
  ChevronRight 
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import CustomButton from '../../components/CustomButton';
import Dropdown from '../../components/Dropdown';

/**
 * Home page component with navigation menu
 * Shows available features based on user roles
 */
const Home: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const languageOptions = [
    { value: 'en', label: t('languages.en') },
    { value: 'es', label: t('languages.es') },
  ];

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: t('pages.roleTest.title'),
      description: t('pages.roleTest.description'),
      icon: TestTube,
      href: '/role-test',
      available: true,
    },
    {
      title: t('pages.localization.title'),
      description: t('pages.localization.description'),
      icon: MapPin,
      href: '/localization',
      available: true,
    },
    {
      title: t('pages.users.title'),
      description: t('pages.users.description'),
      icon: Users,
      href: '/users',
      available: hasRole('ROLE_ADMIN'),
    },
    {
      title: t('pages.audit.title'),
      description: t('pages.audit.description'),
      icon: FileText,
      href: '/audit',
      available: hasRole('ROLE_ADMIN') || hasRole('ROLE_AUDITOR'),
    },
  ];

  const availableItems = menuItems.filter(item => item.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                {t('pages.home.adminPortal')}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="w-40">
                <Dropdown
                  options={languageOptions}
                  value={i18n.language}
                  onSelect={handleLanguageChange}
                  placeholder={t('navigation.changeLanguage')}
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.roles.map(role => role.replace('ROLE_', '')).join(', ')}

                  </p>
                </div>
                
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="h-4 w-4" />}
                >
                  {t('auth.logout')}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('pages.home.welcome')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('pages.home.description')}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                    <item.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats or Additional Info */}        
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-4 bg-white rounded-lg shadow p-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800">{t('pages.home.userManagement')}</h4>
              <p className="text-xs text-gray-500">
                {hasRole('ROLE_ADMIN')
                  ? t('pages.home.userAccess.granted')
                  : t('pages.home.userAccess.denied')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-lg shadow p-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Globe className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800">{t('pages.home.multiLanguage')}</h4>
              <p className="text-xs text-gray-500">{t('pages.home.multiLanguageDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-lg shadow p-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800">{t('pages.home.auditLogs')}</h4>
              <p className="text-xs text-gray-500">
                {hasRole('ROLE_ADMIN') || hasRole('ROLE_AUDITOR')
                  ? t('pages.home.auditAccess.granted')
                  : t('pages.home.auditAccess.denied')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
