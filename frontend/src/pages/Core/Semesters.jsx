import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Semesters = () => (
  <CoreResourcePage
    title="Semesters"
    endpoint="/semesters"
    icon="bi-list-ol"
    fields={[
      { name: 'name', label: 'Semester Name', placeholder: 'e.g. First Semester' },
      { name: 'semesterNumber', label: 'Semester Number', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', optional: true },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'name', label: 'Name', className: 'px-4 fw-bold text-primary' },
      { key: 'semesterNumber', label: 'Number' },
      { key: 'description', label: 'Description' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Semesters;
