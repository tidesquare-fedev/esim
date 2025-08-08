import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from './ui/Icons';
import GuidePopup from './GuidePopup';
import type { Country } from '../lib/types';

// API 호출 부분은 이전과 동일하게 유지합니다 (현재는 주석 처리된 상태)
const fetchCountryByCity = async (cityName: string): Promise<string | null> => {
    console.log(`[API 호출 비활성화] 도시 검색 기능 테스트를 위해 이 부분은 실행되지 않습니다: ${cityName}`);
    return null;
};

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface CountrySelectorProps {
    countries: Country[];
    onCountriesSelect: (selected: Country[]) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ countries, onCountriesSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries);
    const [isSearching, setIsSearching] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        setFilteredCountries(countries);
    }, [countries]);

    useEffect(() => {
        const performSmartSearch = async () => {
            if (!debouncedSearchTerm) {
                setFilteredCountries(countries);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase().trim();
            const localResults = countries.filter(c =>
                c.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                (c.keywords && c.keywords.some(k => k.toLowerCase().includes(lowerCaseSearchTerm)))
            );

            if (localResults.length > 0) {
                setFilteredCountries(localResults);
                setIsSearching(false);
                return;
            }

            const countryCodeFromApi = await fetchCountryByCity(lowerCaseSearchTerm);
            if (countryCodeFromApi) {
                const countryFromApi = countries.find(c => c.id === countryCodeFromApi);
                setFilteredCountries(countryFromApi ? [countryFromApi] : []);
            } else {
                setFilteredCountries([]);
            }
            setIsSearching(false);
        };
        performSmartSearch();
    }, [debouncedSearchTerm, countries]);

    const toggleCountry = (countryId: string) => {
        setSelected(prev =>
            prev.includes(countryId) ? prev.filter(id => id !== countryId) : [...prev, countryId]
        );
    };

    const handleNext = () => {
        const selectedCountryObjects = countries.filter(c => selected.includes(c.id));
        onCountriesSelect(selectedCountryObjects);
    };

    return (
        <>
            {isGuideOpen && <GuidePopup onClose={() => setIsGuideOpen(false)} />}
            <div className="p-4 md:p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">어디로 여행가시나요?</h1>
                    <button 
                        onClick={() => setIsGuideOpen(true)}
                        className="text-lg font-medium text-custom-blue hover:underline"
                    >
                        eSIM 가이드
                    </button>
                </div>
                <p className="text-gray-500 mt-1 mb-6">여행할 국가를 모두 선택해주세요.</p>
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="도시나 국가명 검색 (예: 나트랑, 파리)"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="min-h-[300px]">
                    {isSearching ? (
                         <div className="text-center py-10 text-gray-500">검색 중...</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-x-6 gap-y-8">
                            {filteredCountries.map(country => {
                                 const isSelected = selected.includes(country.id);
                                 return (
                                     <div
                                         key={country.id}
                                         onClick={() => toggleCountry(country.id)}
                                         className="cursor-pointer group"
                                     >
                                         <div className={`relative border-2 rounded-xl transition-all duration-200 overflow-hidden ${isSelected ? 'border-custom-blue' : 'border-transparent'}`}>
                                             <img 
                                                 src={country.image} 
                                                 alt={country.name} 
                                                 className="w-full h-28 object-contain bg-gray-100 rounded-lg group-hover:scale-105 transition-transform" 
                                                 onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src='https://placehold.co/400x300/E2E8F0/4A5568?text=No+Flag'; }} 
                                             />
                                             {isSelected && (
                                                 <div className="absolute top-2 right-2 w-6 h-6 bg-custom-blue rounded-full flex items-center justify-center text-white ring-2 ring-white">
                                                     <CheckCircle className="w-4 h-4" />
                                                 </div>
                                             )}
                                         </div>
                                         <p className={`text-center mt-3 text-base ${isSelected ? 'font-bold text-custom-blue' : 'font-medium text-gray-700'}`}>
                                             {country.name}
                                         </p>
                                     </div>
                                 );
                            })}
                            {filteredCountries.length === 0 && !isSearching && searchTerm && (
                                <div className="col-span-3 text-center py-10 text-gray-500">
                                    검색 결과가 없습니다.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {selected.length > 0 && (
                    <div className="mt-12">
                        <button
                            onClick={handleNext}
                            className="w-full bg-custom-blue text-white font-bold py-4 rounded-lg text-lg hover:brightness-95 transition"
                        >
                            {selected.length}개 국가 eSIM 검색하기
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default CountrySelector;
