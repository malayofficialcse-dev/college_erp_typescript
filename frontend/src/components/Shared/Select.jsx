import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import './Select.css';

const Select = ({
  label,
  placeholder = 'Select an option',
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  name,
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);
  const selectId = id || `select-${name}`;

  useEffect(() => {
    if (searchable && isOpen) {
      setFilteredOptions(
        options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, isOpen, options, searchable]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      const isSelected = newValue.some((v) => v.value === option.value);
      const updatedValue = isSelected
        ? newValue.filter((v) => v.value !== option.value)
        : [...newValue, option];
      onChange(updatedValue);
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const displayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value.length === 0
        ? placeholder
        : `${value.length} selected`;
    }
    return value?.label || placeholder;
  };

  return (
    <div className={`select-wrapper ${className}`} ref={wrapperRef}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <div
        className={`select-input ${error ? 'select-error' : ''} ${
          isOpen ? 'select-open' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        id={selectId}
      >
        <div className="select-value">{displayValue()}</div>
        <div className="select-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 11L3 6h10z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="select-menu">
          {searchable && (
            <input
              type="text"
              className="select-search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <ul className="select-options" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="select-no-options">No options found</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(value) &&
                    value.some((v) => v.value === option.value)
                  : value?.value === option.value;
                return (
                  <li
                    key={option.value}
                    className={`select-option ${
                      isSelected ? 'select-option-selected' : ''
                    }`}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="select-checkbox"
                      />
                    )}
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {(error || helperText) && (
        <span className={`select-helper ${error ? 'select-helper-error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
    })
  ),
  value: PropTypes.oneOfType([
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      })
    ),
  ]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
