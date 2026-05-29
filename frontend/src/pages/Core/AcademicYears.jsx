import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const AcademicYears = () => (
  <CoreResourcePage
    title="Academic Years"
    endpoint="/academic-years"
    icon="bi-calendar-range"
    fields={[
      { name: 'name', label: 'Name', placeholder: 'e.g. 2024-2025' },
      { name: 'startYear', label: 'Start Year', type: 'number' },
      { name: 'endYear', label: 'End Year', type: 'number' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'name', label: 'Name', className: 'px-4 fw-bold text-primary' },
      { key: 'startYear', label: 'Start Year' },
      { key: 'endYear', label: 'End Year' },
      { key: 'startDate', label: 'Start Date', render: (item) => String(item.startDate || '').slice(0, 10) || 'N/A' },
      { key: 'endDate', label: 'End Date', render: (item) => String(item.endDate || '').slice(0, 10) || 'N/A' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default AcademicYears;
