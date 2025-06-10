
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react';

import api from '../../api/config';
import CustomButton from '../../components/CustomButton';
import { useToast } from '../../hooks/use-toast';

interface TestResult {
  endpoint: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  response?: any;
  error?: string;
}

/**
 * Role-based API testing page
 * Tests different API endpoints based on user permissions
 */
const RoleTest: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [results, setResults] = useState<TestResult[]>([
    { endpoint: '/api/test/all', status: 'idle' },
    { endpoint: '/api/test/user', status: 'idle' },
    { endpoint: '/api/test/admin', status: 'idle' },
    { endpoint: '/api/test/auditor', status: 'idle' },
  ]);

  const testEndpoint = async (endpoint: string, index: number) => {
    // Update status to loading
    setResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status: 'loading' as const } : result
    ));

    try {
      const response = await api.get(endpoint);
      
      setResults(prev => prev.map((result, i) => 
        i === index ? { 
          ...result, 
          status: 'success' as const, 
          response: response.data,
          error: undefined 
        } : result
      ));

      toast({
        title: t('common.success'),
        description: `${endpoint} - Request successful`,
        variant: 'default',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      setResults(prev => prev.map((result, i) => 
        i === index ? { 
          ...result, 
          status: 'error' as const, 
          error: errorMessage,
          response: undefined 
        } : result
      ));

      toast({
        title: t('common.error'),
        description: `${endpoint} - ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const getButtonText = (endpoint: string) => {
    switch (endpoint) {
      case '/api/test/all':
        return t('pages.roleTest.testAll');
      case '/api/test/user':
        return t('pages.roleTest.testUser');
      case '/api/test/admin':
        return t('pages.roleTest.testAdmin');
      case '/api/test/auditor':
        return t('pages.roleTest.testAuditor');
      default:
        return 'Test API';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent" />;
      default:
        return <Play className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')} to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('pages.roleTest.title')}
          </h1>
          <p className="text-gray-600">
            {t('pages.roleTest.description')}
          </p>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result, index) => (
            <div key={result.endpoint} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getButtonText(result.endpoint)}
                </h3>
                {getStatusIcon(result.status)}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 font-mono bg-gray-100 p-2 rounded">
                {result.endpoint}
              </p>

              <CustomButton
                onClick={() => testEndpoint(result.endpoint, index)}
                isLoading={result.status === 'loading'}
                className="w-full mb-4"
                variant="primary"
              >
                {result.status === 'loading' ? t('pages.roleTest.testing') : 'Test Endpoint'}
              </CustomButton>

              {/* Response Display */}
              {result.status === 'success' && result.response && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    {t('pages.roleTest.response')}:
                  </h4>
                  <pre className="text-xs text-green-700 overflow-x-auto">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              )}

              {result.status === 'error' && result.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Error:
                  </h4>
                  <p className="text-xs text-red-700">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            API Endpoint Information
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">/api/test/all</span>
              <span className="text-gray-600">Public access - Available to all users</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">/api/test/user</span>
              <span className="text-gray-600">User access - Requires authentication</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">/api/test/admin</span>
              <span className="text-gray-600">Admin access - Requires ADMIN role</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">/api/test/auditor</span>
              <span className="text-gray-600">Auditor access - Requires AUDITOR role</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleTest;
