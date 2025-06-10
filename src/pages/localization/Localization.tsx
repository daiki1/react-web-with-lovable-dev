
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, ChevronDown } from 'lucide-react';

import api from '../../api/config';
import CustomButton from '../../components/CustomButton';
import Dropdown from '../../components/Dropdown';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useToast } from '../../hooks/use-toast';

interface Country {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
  countryId: number;
}

interface City {
  id: number;
  name: string;
  stateId: number;
}

/**
 * Localization page with cascading dropdowns
 * Allows selection of country, state, and city with pagination
 */
const Localization: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [citiesPage, setCitiesPage] = useState(0);
  const [hasMoreCities, setHasMoreCities] = useState(false);
  const [loadingMoreCities, setLoadingMoreCities] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadStates(parseInt(selectedCountry));
      setSelectedState('');
      setSelectedCity('');
      setCities([]);
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      setCitiesPage(0);
      loadCities(parseInt(selectedState), 0, true);
      setSelectedCity('');
    }
  }, [selectedState]);

  const loadCountries = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/countries');
      setCountries(response.data);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to load countries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStates = async (countryId: number) => {
    try {
      const response = await api.get(`/api/countries/${countryId}/states`);
      setStates(response.data);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to load states',
        variant: 'destructive',
      });
    }
  };

  const loadCities = async (stateId: number, page: number = 0, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setLoadingMoreCities(true);
    }

    try {
      const response = await api.get(
        `/api/states/${stateId}/cities?page=${page}&size=100`
      );
      
      const newCities = response.data.content || response.data;
      const totalPages = response.data.totalPages || 1;
      
      if (reset) {
        setCities(newCities);
      } else {
        setCities(prev => [...prev, ...newCities]);
      }
      
      setHasMoreCities(page + 1 < totalPages);
      setCitiesPage(page);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || 'Failed to load cities',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setLoadingMoreCities(false);
    }
  };

  const loadMoreCities = () => {
    if (selectedState && hasMoreCities && !loadingMoreCities) {
      loadCities(parseInt(selectedState), citiesPage + 1, false);
    }
  };

  const countryOptions = countries.map(country => ({
    value: country.id.toString(),
    label: country.name,
  }));

  const stateOptions = states.map(state => ({
    value: state.id.toString(),
    label: state.name,
  }));

  const cityOptions = cities.map(city => ({
    value: city.id.toString(),
    label: city.name,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <LoaderOverlay isVisible={isLoading} message={t('common.loading')} />
      
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
            {t('pages.localization.title')}
          </h1>
          <p className="text-gray-600">
            {t('pages.localization.description')}
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Country Dropdown */}
            <div className="space-y-2">
              <Dropdown
                label={t('pages.localization.country')}
                options={countryOptions}
                value={selectedCountry}
                onSelect={setSelectedCountry}
                placeholder={t('pages.localization.selectCountry')}
                disabled={countries.length === 0}
              />
            </div>

            {/* State Dropdown */}
            <div className="space-y-2">
              <Dropdown
                label={t('pages.localization.state')}
                options={stateOptions}
                value={selectedState}
                onSelect={setSelectedState}
                placeholder={t('pages.localization.selectState')}
                disabled={!selectedCountry || states.length === 0}
              />
            </div>

            {/* City Dropdown */}
            <div className="space-y-2">
              <Dropdown
                label={t('pages.localization.city')}
                options={cityOptions}
                value={selectedCity}
                onSelect={setSelectedCity}
                placeholder={t('pages.localization.selectCity')}
                disabled={!selectedState || cities.length === 0}
              />
              
              {/* Load More Cities Button */}
              {selectedState && hasMoreCities && (
                <CustomButton
                  onClick={loadMoreCities}
                  isLoading={loadingMoreCities}
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2"
                >
                  {loadingMoreCities 
                    ? t('common.loading')
                    : t('pages.localization.loadMoreCities')
                  }
                </CustomButton>
              )}

              {selectedState && !hasMoreCities && cities.length > 0 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  {t('pages.localization.noMoreCities')}
                </p>
              )}
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedCountry || selectedState || selectedCity) && (
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Current Selection
              </h3>
              
              <div className="space-y-2 text-sm">
                {selectedCountry && (
                  <div className="flex justify-between">
                    <span className="font-medium">{t('pages.localization.country')}:</span>
                    <span className="text-orange-700">
                      {countries.find(c => c.id.toString() === selectedCountry)?.name || selectedCountry}
                    </span>
                  </div>
                )}
                
                {selectedState && (
                  <div className="flex justify-between">
                    <span className="font-medium">{t('pages.localization.state')}:</span>
                    <span className="text-orange-700">
                      {states.find(s => s.id.toString() === selectedState)?.name || selectedState}
                    </span>
                  </div>
                )}
                
                {selectedCity && (
                  <div className="flex justify-between">
                    <span className="font-medium">{t('pages.localization.city')}:</span>
                    <span className="text-orange-700">
                      {cities.find(c => c.id.toString() === selectedCity)?.name || selectedCity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{countries.length}</p>
              <p className="text-xs text-gray-600">Countries</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{states.length}</p>
              <p className="text-xs text-gray-600">States</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{cities.length}</p>
              <p className="text-xs text-gray-600">Cities Loaded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Localization;
