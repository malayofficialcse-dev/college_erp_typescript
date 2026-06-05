import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const ExamSchedules = () => (
  <CoreResourcePage
    title="Exam Schedules"
    endpoint="/exam-schedules"
    icon="bi-calendar-event"
    relations={{
      courses: { endpoint: '/courses', labelPaths: ['code', 'name'] },
      semesters: { endpoint: '/semesters', labelPaths: ['name', 'semesterNumber'] },
      subjects: { endpoint: '/subjects', labelPaths: ['subjectCode', 'subjectName'] },
      academicYears: { endpoint: '/academic-years', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'examName', label: 'Exam Name' },
      { name: 'examType', label: 'Exam Type', type: 'select', optionsList: [
        { value: 'MID_TERM', label: 'MID_TERM' },
        { value: 'FINAL', label: 'FINAL' },
        { value: 'PRACTICAL', label: 'PRACTICAL' },
        { value: 'VIVA', label: 'VIVA' },
      ], defaultValue: 'MID_TERM' },
      { name: 'course', label: 'Course', type: 'select', options: 'courses' },
      { name: 'semester', label: 'Semester', type: 'select', options: 'semesters' },
      { name: 'subject', label: 'Subject', type: 'select', options: 'subjects' },
      { name: 'academicYear', label: 'Academic Year', type: 'select', options: 'academicYears' },
      { name: 'examDate', label: 'Exam Date', type: 'date' },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'totalMarks', label: 'Total Marks', type: 'number', defaultValue: 100, optional: true },
      { name: 'duration', label: 'Duration (Minutes)', type: 'number', defaultValue: 180, optional: true },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'examName', label: 'Exam', className: 'px-4 fw-bold text-primary' },
      { key: 'course.name', label: 'Course' },
      { key: 'semester.name', label: 'Semester' },
      { key: 'subject.subjectName', label: 'Subject' },
      { key: 'examDate', label: 'Date', render: (item) => String(item.examDate || '').slice(0, 10) || 'N/A' },
      { key: 'startTime', label: 'Time', render: (item) => String(item.startTime || '').slice(0, 5) || 'N/A' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default ExamSchedules;
 