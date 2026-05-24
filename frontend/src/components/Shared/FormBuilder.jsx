import PropTypes from 'prop-types';
import { useState } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import './FormBuilder.css';

const FormBuilder = ({
  fields = [],
  onSubmit,
  submitButtonText = 'Submit',
  submitButtonVariant = 'primary',
  validation = {},
  onChange,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (fieldName, value) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: undefined });
    }

    if (onChange) onChange(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      const value = formData[field.name];
      const validators = validation[field.name];

      if (validators) {
        if (validators.required && (!value || value.toString().trim() === '')) {
          newErrors[field.name] = `${field.label || field.name} is required`;
        } else if (validators.minLength && value && value.toString().length < validators.minLength) {
          newErrors[field.name] = `Must be at least ${validators.minLength} characters`;
        } else if (validators.pattern && value && !validators.pattern.test(value)) {
          newErrors[field.name] = validators.patternMessage || 'Invalid format';
        } else if (validators.custom) {
          const error = validators.custom(value);
          if (error) newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      if (onSubmit) onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      error: errors[field.name],
      required: validation[field.name]?.required,
      value: formData[field.name] || (field.type === 'checkbox' ? false : ''),
      onChange: (e) => {
        const value = field.type === 'checkbox' ? e.target.checked : e.target.value;
        handleChange(field.name, value);
      },
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input
            key={field.name}
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            helperText={field.helperText}
          />
        );

      case 'select':
        return (
          <Select
            key={field.name}
            {...commonProps}
            options={field.options || []}
            multiple={field.multiple}
            searchable={field.searchable}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <div key={field.name} className="form-group">
            {field.label && (
              <label htmlFor={field.name} className="form-label">
                {field.label}
                {validation[field.name]?.required && (
                  <span className="form-required">*</span>
                )}
              </label>
            )}
            <textarea
              id={field.name}
              name={field.name}
              className={`form-textarea ${errors[field.name] ? 'form-error' : ''}`}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={field.rows || 4}
            />
            {errors[field.name] && (
              <span className="form-error-text">{errors[field.name]}</span>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="form-checkbox">
            <input
              id={field.name}
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            />
            <label htmlFor={field.name}>{field.label}</label>
          </div>
        );

      case 'radio':
        return (
          <div key={field.name} className="form-radio-group">
            {field.label && <label className="form-label">{field.label}</label>}
            {field.options?.map((option) => (
              <div key={option.value} className="form-radio">
                <input
                  id={`${field.name}-${option.value}`}
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
                <label htmlFor={`${field.name}-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form className="form-builder" onSubmit={handleSubmit}>
      <div className="form-fields">
        {fields.map((field) => renderField(field))}
      </div>
      <Button type="submit" variant={submitButtonVariant} fullWidth>
        {submitButtonText}
      </Button>
    </form>
  );
};

FormBuilder.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        'text',
        'email',
        'password',
        'number',
        'select',
        'textarea',
        'checkbox',
        'radio',
      ]),
      label: PropTypes.string,
      placeholder: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          label: PropTypes.string,
        })
      ),
      rows: PropTypes.number,
      multiple: PropTypes.bool,
      searchable: PropTypes.bool,
      helperText: PropTypes.string,
    })
  ),
  onSubmit: PropTypes.func,
  submitButtonText: PropTypes.string,
  submitButtonVariant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info']),
  validation: PropTypes.object,
  onChange: PropTypes.func,
};

export default FormBuilder;
