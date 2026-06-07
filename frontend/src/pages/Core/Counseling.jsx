import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Counseling = () => (
  <CoreResourcePage
    title="Counseling"
    endpoint="/core/counseling"
    icon="bi-headset"
    relations={{
      students: { endpoint: '/core/students', labelPaths: ['enrollmentNumber', 'firstName', 'lastName'], filterByDepartment: true },
      teachers: { endpoint: '/core/teachers', labelPaths: ['employeeCode', 'firstName', 'lastName'], filterByDepartment: true },
    }}
    fields={[
      { name: 'student', label: 'Student', type: 'select', options: 'students' },
      { name: 'counselor', label: 'Counselor', type: 'select', options: 'teachers' },
      { name: 'sessionDate', label: 'Session Date', type: 'date' },
      { name: 'sessionTime', label: 'Session Time', type: 'time', optional: true },
      { name: 'topic', label: 'Topic', placeholder: 'e.g. Academic Progress, Career Guidance' },
      { name: 'notes', label: 'Notes', type: 'textarea', optional: true },
      { name: 'status', label: 'Status', type: 'select', optionsList: [{ value: 'SCHEDULED', label: 'Scheduled' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' }], defaultValue: 'SCHEDULED' },
    ]}
    columns={[
      { key: 'student', label: 'Student', className: 'px-4 fw-bold text-primary', render: (item) => item.student ? `${item.student.firstName} ${item.student.lastName}` : 'N/A' },
      { key: 'counselor', label: 'Counselor', render: (item) => item.counselor ? `${item.counselor.firstName} ${item.counselor.lastName}` : 'N/A' },
      { key: 'topic', label: 'Topic' },
      { key: 'sessionDate', label: 'Date', render: (item) => String(item.sessionDate || '').slice(0, 10) || 'N/A' },
      { key: 'status', label: 'Status' },
    ]}
  />
);

export default Counseling;
