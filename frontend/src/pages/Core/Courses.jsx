import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Courses = () => (
  <CoreResourcePage
    title="Courses"
    endpoint="/courses"
    icon="bi-journal-bookmark-fill"
    relations={{
      departments: { endpoint: '/departments', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'code', label: 'Course Code' },
      { name: 'name', label: 'Course Title' },
      { name: 'description', label: 'Description', type: 'textarea', optional: true },
      { name: 'department', label: 'Department', type: 'select', options: 'departments' },
      { name: 'courseType', label: 'Course Type', type: 'select', optionsList: [{ value: 'UNDERGRADUATE', label: 'Undergraduate' }, { value: 'POSTGRADUATE', label: 'Postgraduate' }, { value: 'DIPLOMA', label: 'Diploma' }, { value: 'CERTIFICATE', label: 'Certificate' }], defaultValue: 'UNDERGRADUATE' },
      { name: 'totalSemesters', label: 'Total Semesters', type: 'number', defaultValue: 8 },
      { name: 'duration', label: 'Duration (Years)', type: 'number', defaultValue: 4 },
      { name: 'credits', label: 'Total Credits', type: 'number', optional: true },
      { name: 'fees', label: 'Fees', type: 'number', defaultValue: 0 },
      { name: 'status', label: 'Status', type: 'select', optionsList: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ARCHIVED', label: 'Archived' }], defaultValue: 'ACTIVE' },
    ]}
    columns={[
      { key: 'code', label: 'Code', className: 'px-4 fw-bold text-primary' },
      { key: 'name', label: 'Title' },
      { key: 'department.name', label: 'Department' },
      { key: 'courseType', label: 'Type' },
      { key: 'totalSemesters', label: 'Semesters' },
      { key: 'duration', label: 'Years' },
      { key: 'status', label: 'Status' },
    ]}
  />
);

export default Courses;
