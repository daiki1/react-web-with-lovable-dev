
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity,
  Eye 
} from 'lucide-react';

import api from '../../api/config';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import Dropdown from '../../components/Dropdown';
import PopupDialog from '../../components/PopupDialog';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useToast } from '../../hooks/use-toast';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  username: string;
  operation: string;  
  resource: string;  
  details: string;
  ipAddress: string;
  userAgent?: string;
}

/**
 * Audit logs page for administrators and auditors
 * Displays system activity logs with filtering and search
 */
const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage]);

  useEffect(() => {
    // Filter logs based on search term and action filter
    let filtered = logs.filter(log =>
      (log.userId && log.userId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.operation && log.operation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.resource && log.resource.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) 
    );

    if (actionFilter) {
      filtered = filtered.filter(log => log.operation === actionFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/api/audit/audit-logs?page=${currentPage}&size=${pageSize}&sort=timestamp,desc`
      );
      
      setLogs(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsDialog(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadge = (action: string) => {
    const actionColors: { [key: string]: string } = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'LOGIN': 'bg-purple-100 text-purple-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'VIEW': 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        actionColors[action] || 'bg-gray-100 text-gray-800'
      }`}>
        {action}
      </span>
    );
  };

  const parseDetailsWithJson = (details: string) => {
    try {
      const result = [];
      let currentIndex = 0;
      
      // Find all JSON objects by looking for { and matching }
      while (currentIndex < details.length) {
        const openBrace = details.indexOf('{', currentIndex);
        
        if (openBrace === -1) {
          // No more JSON objects, add remaining text
          const remainingText = details.slice(currentIndex).trim();
          if (remainingText) {
            result.push({
              type: 'text',
              content: remainingText
            });
          }
          break;
        }
        
        // Add text before the JSON object
        const textBefore = details.slice(currentIndex, openBrace).trim();
        if (textBefore) {
          result.push({
            type: 'text',
            content: textBefore
          });
        }
        
        // Find the matching closing brace
        let braceCount = 0;
        let jsonEnd = openBrace;
        
        for (let i = openBrace; i < details.length; i++) {
          if (details[i] === '{') {
            braceCount++;
          } else if (details[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
        
        // Extract and parse the JSON
        const jsonString = details.slice(openBrace, jsonEnd);
        try {
          const jsonData = JSON.parse(jsonString);
          result.push({
            type: 'json',
            content: jsonData
          });
        } catch {
          // If JSON parsing fails, treat as text
          result.push({
            type: 'text',
            content: jsonString
          });
        }
        
        currentIndex = jsonEnd;
      }
      
      return result;
    } catch (error) {
      // If parsing fails, return original text
      return [{
        type: 'text',
        content: details
      }];
    }
  };

  const renderJsonAsTable = (jsonData: any) => {
    if (typeof jsonData !== 'object' || jsonData === null) {
      return <span className="text-sm text-gray-900">{String(jsonData)}</span>;
    }

    return (
      <div className="bg-gray-50 rounded-lg p-3 border">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(jsonData).map(([key, value]) => (
              <tr key={key} className="border-b border-gray-200 last:border-b-0">
                <td className="py-1 pr-3 font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </td>
                <td className="py-1 text-gray-900">
                  {typeof value === 'object' && value !== null ? (
                    Array.isArray(value) ? (
                      <div className="space-y-1">
                        {value.map((item, index) => (
                          <div key={index} className="text-xs bg-white rounded p-1 border">
                            {typeof item === 'object' ? (
                              <div className="space-y-1">
                                {Object.entries(item).map(([subKey, subValue]) => (
                                  <div key={subKey}>
                                    <span className="font-medium">{subKey}:</span> {String(subValue)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              String(item)
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs bg-white rounded p-1 border">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey}>
                            <span className="font-medium">{subKey}:</span> {String(subValue)}
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <span className={typeof value === 'boolean' ? 
                      (value ? 'text-green-600' : 'text-red-600') : 
                      'text-gray-900'
                    }>
                      {String(value)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(logs.map(log => log.operation)));
  const actionOptions = [
    { value: '', label: 'All Actions' },
    ...uniqueActions.map(action => ({ value: action, label: action }))
  ];

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
                {t('pages.audit.title')}
              </h1>
              <p className="text-gray-600">
                Monitor system activities and user actions
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>{filteredLogs.length} logs found</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <InputField
                placeholder="Search logs by user, action, resource, or details..."
                icon={<Search className="h-4 w-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Dropdown
                options={actionOptions}
                value={actionFilter}
                onSelect={setActionFilter}
                placeholder="Filter by action"
                icon={<Filter className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.audit.timestamp')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.audit.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.audit.action')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.audit.resource')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('pages.audit.ipAddress')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDateTime(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {log.userId} - {log.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.operation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => showLogDetails(log)}
                        className="text-orange-600 hover:text-orange-700 transition-colors duration-200"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          )}

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

        {/* Log Details Dialog with Enhanced JSON Formatting */}
        <PopupDialog
          isOpen={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          title="Audit Log Details"
          size="lg"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pages.audit.timestamp')}
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedLog.timestamp)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pages.audit.user')}
                  </label>
                  <p className="text-sm text-gray-900">{selectedLog.userId} - {selectedLog.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pages.audit.action')}
                  </label>
                  <div>{getActionBadge(selectedLog.operation)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pages.audit.resource')}
                  </label>
                  <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pages.audit.ipAddress')}
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pages.audit.details')}
                </label>
                <div className="space-y-3">
                  {parseDetailsWithJson(selectedLog.details).map((part, index) => (
                    <div key={index}>
                      {part.type === 'text' ? (
                        <div className="text-sm text-gray-900 font-medium capitalize">
                          {part.content}
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                            {index === 1 ? 'Original Data' : index === 3 ? 'Updated Data' : 'Data'}
                          </div>
                          {renderJsonAsTable(part.content)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedLog.userAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Agent
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900 break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </PopupDialog>
      </div>
    </div>
  );
};

export default AuditLogs;
