import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const TripFilters = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // הגדרת מצב התחלתי מה-URL
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');

  // רשימת המדינות שביקשת
  const countries = [
    { value: 'Israel', label: 'ישראל 🇮🇱' },
    { value: 'USA', label: 'ארה"ב 🇺🇸' },
    { value: 'Greece', label: 'יוון 🇬🇷' },
    { value: 'Italy', label: 'איטליה 🇮🇹' },
    { value: 'France', label: 'צרפת 🇫🇷' }
  ];

  // לוגיקת "ישראל תחילה" למשתמשים ישראלים
  useEffect(() => {
    if (!searchParams.get('country')) {
      const isIsraeli = navigator.language.includes('he') || 
                       Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Jerusalem';
      if (isIsraeli) {
        setCountry('Israel');
        handleSearch('Israel', query);
      }
    }
  }, []);

  const handleSearch = (selectedCountry, selectedQuery) => {
    // 1. עדכון ה-URL כדי שגוגל יוכל לאנדקס את החיפוש
    const params = {};
    if (selectedQuery) params.q = selectedQuery;
    if (selectedCountry) params.country = selectedCountry;
    setSearchParams(params);

    // 2. שליחת הפילטרים לרכיב האב כדי שיבצע Fetch מה-Database
    if (onSearch) {
      onSearch({ q: selectedQuery, country: selectedCountry });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-100 rounded-lg">
      <input 
        type="text" 
        placeholder="חפש לפי שם טיול..." 
        className="p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <select 
        className="p-2 border rounded"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">כל המדינות</option>
        {countries.map(c => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <button 
        onClick={() => handleSearch(country, query)}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        חפש 🔍
      </button>
    </div>
  );
};

export default TripFilters;