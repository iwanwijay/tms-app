import React, { useState, useRef, useEffect } from 'react';
// import './search-select.css'; // Import the CSS file

const SearchSelect = ({ options, placeholder = 'Search...', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    if (!options) return;

    const filtered = options.filter(option =>
      option.store_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.store_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setSearchTerm(`${option.store_code} - ${option.store_name}`);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="search-select-container" ref={wrapperRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
        />
        <div className="dropdown-arrow-container">
          <svg
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="dropdown-menu">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.store_code}
                className="dropdown-option"
                onClick={() => handleSelectOption(option)}
              >
                {option.store_code} - {option.store_name}
              </div>
            ))
          ) : (
            <div className="no-options">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSelect;