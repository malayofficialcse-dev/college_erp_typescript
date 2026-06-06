import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Students = () => (
  <CoreResourcePage
    title="Students"
    endpoint="/students"
    icon="bi-person-badge-fill"
    relations={{
      departments: { endpoint: '/departments', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'enrollmentNumber', label: 'Enrollment Number' },
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone Number' },
      { name: 'gender', label: 'Gender', type: 'select', optionsList: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }] },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { name: 'guardianName', label: 'Guardian Name', optional: true },
      { name: 'guardianPhone', label: 'Guardian Phone', optional: true },
      { name: 'address', label: 'Address', optional: true },
      { name: 'currentSemester', label: 'Current Semester', type: 'number', defaultValue: 1 },
      { name: 'department', label: 'Department', type: 'select', options: 'departments' },
      { name: 'status', label: 'Status', type: 'select', optionsList: [{ value: 'ACTIVE', label: 'Active' }, { value: 'GRADUATED', label: 'Graduated' }, { value: 'DROPPED', label: 'Dropped' }, { value: 'SUSPENDED', label: 'Suspended' }], defaultValue: 'ACTIVE' },
    ]}
    columns={[
      { key: 'enrollmentNumber', label: 'Enrollment No.', className: 'px-4 fw-bold text-primary' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'department.name', label: 'Department' },
      { key: 'currentSemester', label: 'Semester' },
      { key: 'status', label: 'Status' },
    ]}
  />
);

export default Students;
