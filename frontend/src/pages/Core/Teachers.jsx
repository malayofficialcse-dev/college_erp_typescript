import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Teachers = () => (
  <CoreResourcePage
    title="Teachers"
    endpoint="/teachers"
    icon="bi-person-workspace"
    relations={{
      departments: { endpoint: '/departments', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'employeeCode', label: 'Employee Code' },
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone Number' },
      { name: 'gender', label: 'Gender', type: 'select', optionsList: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }] },
      { name: 'department', label: 'Department', type: 'select', options: 'departments' },
      { name: 'qualification', label: 'Qualification', optional: true },
      { name: 'experience', label: 'Experience (Years)', type: 'number', optional: true },
      { name: 'designation', label: 'Designation', optional: true },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'employeeCode', label: 'Code', className: 'px-4 fw-bold text-primary' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'department.name', label: 'Department' },
      { key: 'designation', label: 'Designation' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Teachers;
