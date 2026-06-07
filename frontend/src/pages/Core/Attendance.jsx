import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Attendance = () => (
  <CoreResourcePage
    title="Student Attendance"
    endpoint="/attendance"
    icon="bi-calendar-check-fill"
    relations={{
      students: { endpoint: '/students', labelPaths: ['enrollmentNumber', 'firstName', 'lastName'], filterByDepartment: true },
      subjects: { endpoint: '/subjects', labelPaths: ['subjectCode', 'subjectName'], filterByDepartment: true },
    }}
    fields={[
      { name: 'student', label: 'Student', type: 'select', options: 'students' },
      { name: 'subject', label: 'Subject', type: 'select', options: 'subjects', optional: true },
      {
        name: 'attendanceDate',
        label: 'Date',
        type: 'date',
        payloadKey: 'date',
        deriveValue: (item) => {
          const value = item.attendanceDate || item.date;
          return value ? String(value).slice(0, 10) : '';
        },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        optionsList: [
          { value: 'PRESENT', label: 'Present' },
          { value: 'ABSENT',  label: 'Absent'  },
          { value: 'LATE',    label: 'Late'    },
          { value: 'EXCUSED', label: 'Excused' },
        ],
        defaultValue: 'PRESENT',
      },
      { name: 'remarks', label: 'Remarks', type: 'textarea', optional: true },
    ]}
    columns={[
      {
        key: 'student',
        label: 'Student',
        className: 'px-4 fw-bold text-primary',
        render: (item) => item.student ? `${item.student.firstName} ${item.student.lastName}` : 'N/A',
      },
      {
        key: 'student.enrollmentNumber',
        label: 'Enrollment No.',
        render: (item) => item.student?.enrollmentNumber || 'N/A',
      },
      { key: 'subject.subjectName', label: 'Subject' },
      {
        key: 'attendanceDate',
        label: 'Date',
        render: (item) => {
          const raw = item.attendanceDate || item.date || '';
          return raw ? new Date(raw).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
        },
      },
      { key: 'status', label: 'Status' },
    ]}
    filters={[
      /* ── 1. Text search across all columns ── */
      {
        type: 'search',
        name: 'search',
        placeholder: 'Search by student, subject, enrollment…',
      },

      /* ── 2. Date range filter ── */
      {
        type: 'daterange',
        name: 'attendanceDate',
        label: 'Attendance Date',
        deriveValue: (item) => {
          const v = item.attendanceDate || item.date;
          return v ? String(v).slice(0, 10) : '';
        },
      },

      /* ── 3. Student multi-select dropdown ── */
      {
        type: 'multiselect',
        name: 'student',
        label: 'Student',
        options: 'students',
        deriveValue: (item) => item.student,
        path: 'student',
      },

      /* ── 4. Subject multi-select dropdown ── */
      {
        type: 'multiselect',
        name: 'subject',
        label: 'Subject',
        options: 'subjects',
        deriveValue: (item) => item.subject,
        path: 'subject',
      },

      /* ── 5. Status chips (multi) ── */
      {
        type: 'statuschips',
        name: 'status',
        label: 'Status',
        path: 'status',
      },
    ]}
  />
);

export default Attendance;
