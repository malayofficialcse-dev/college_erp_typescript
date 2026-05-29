import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Sessions = () => (
  <CoreResourcePage
    title="Academic Sessions"
    endpoint="/sessions"
    icon="bi-calendar2-week"
    relations={{
      academicYears: { endpoint: '/academic-years', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'label', label: 'Session Label', placeholder: 'e.g. Odd Semester' },
      { name: 'academicYear', label: 'Academic Year', type: 'select', options: 'academicYears' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: false, cols: 12 },
    ]}
    columns={[
      { key: 'label', label: 'Label', className: 'px-4 fw-bold text-primary' },
      { key: 'academicYear.name', label: 'Academic Year' },
      { key: 'startDate', label: 'Start Date', render: (item) => String(item.startDate || '').slice(0, 10) || 'N/A' },
      { key: 'endDate', label: 'End Date', render: (item) => String(item.endDate || '').slice(0, 10) || 'N/A' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Sessions;
