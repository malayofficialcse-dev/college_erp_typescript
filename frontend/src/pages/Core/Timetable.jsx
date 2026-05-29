import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const dayOptions = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

const Timetable = () => (
  <CoreResourcePage
    title="Timetables"
    endpoint="/timetables"
    icon="bi-calendar3"
    relations={{
      sections: { endpoint: '/sections', labelPaths: ['code', 'name'] },
      subjects: { endpoint: '/subjects', labelPaths: ['subjectCode', 'subjectName'] },
      teachers: { endpoint: '/teachers', labelPaths: ['employeeCode', 'firstName', 'lastName'] },
      classrooms: { endpoint: '/classrooms', labelPaths: ['roomNumber', 'building'] },
    }}
    fields={[
      { name: 'section', label: 'Section', type: 'select', options: 'sections' },
      { name: 'subject', label: 'Subject', type: 'select', options: 'subjects' },
      { name: 'teacher', label: 'Teacher', type: 'select', options: 'teachers' },
      { name: 'classroom', label: 'Classroom', type: 'select', options: 'classrooms' },
      { name: 'dayOfWeek', label: 'Day of Week', type: 'select', optionsList: dayOptions },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'section.name', label: 'Section', className: 'px-4 fw-bold text-primary' },
      { key: 'subject.subjectName', label: 'Subject' },
      { key: 'teacher', label: 'Teacher', render: (item) => item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : 'N/A' },
      { key: 'classroom.roomNumber', label: 'Classroom' },
      { key: 'dayOfWeek', label: 'Day' },
      { key: 'startTime', label: 'Start Time', render: (item) => String(item.startTime || '').slice(0, 5) || 'N/A' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Timetable;
