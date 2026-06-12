import React, { useState, useRef } from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtSalary = (n) => {
  if (!n && n !== 0) return 'N/A';
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const yearsDiff = (start, end) => {
  if (!start) return null;
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const years  = Math.floor((e - s) / (365.25 * 24 * 3600 * 1000));
  const months = Math.floor(((e - s) % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000));
  if (years === 0 && months === 0) return 'less than a month';
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
};

const todayFmt = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

const COLLEGE_NAME    = 'ERP Pro College of Engineering';
const COLLEGE_ADDRESS = '123, Knowledge Park, Tech City – 560001';
const COLLEGE_EMAIL   = 'hr@erppro.edu.in';
const COLLEGE_PHONE   = '+91-80-12345678';

/* ─── Letter Configs ─────────────────────────────────────────────────────── */
const LETTER_TYPES = [
  { key: 'offer',       label: 'Offer Letter',       icon: 'bi-file-earmark-person-fill',    color: '#4318FF', bg: '#f0edff' },
  { key: 'appointment', label: 'Appointment Letter',  icon: 'bi-file-earmark-check-fill',    color: '#0ea5e9', bg: '#e0f2fe' },
  { key: 'relieving',   label: 'Relieving Letter',    icon: 'bi-file-earmark-arrow-up-fill', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'contract',    label: 'Contract Letter',     icon: 'bi-file-earmark-ruled-fill',    color: '#10b981', bg: '#d1fae5' },
  { key: 'experience',  label: 'Experience Letter',   icon: 'bi-file-earmark-medal-fill',    color: '#ef4444', bg: '#fee2e2' },
];

/* ─── Shared Letter Shell ────────────────────────────────────────────────── */
const LetterShell = ({ children, refEl }) => (
  <div ref={refEl} id="letter-print-area" style={{
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#1a1a1a',
    background: '#fff',
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 50px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  }}>
    {/* Letterhead */}
    <div style={{ borderBottom: '3px solid #4318FF', paddingBottom: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: 'linear-gradient(135deg,#4318FF,#868CFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, fontFamily: 'sans-serif' }}>E</span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#4318FF', fontFamily: 'sans-serif', letterSpacing: '-0.3px' }}>
            {COLLEGE_NAME}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'sans-serif' }}>
            {COLLEGE_ADDRESS} &nbsp;|&nbsp; {COLLEGE_EMAIL} &nbsp;|&nbsp; {COLLEGE_PHONE}
          </div>
        </div>
      </div>
    </div>
    {children}
    {/* Footer */}
    <div style={{ marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 16, fontSize: 11, color: '#94a3b8', textAlign: 'center', fontFamily: 'sans-serif' }}>
      This is a system-generated document issued by {COLLEGE_NAME}. For verification, contact {COLLEGE_EMAIL}.
    </div>
  </div>
);

/* ─── Individual Letter Templates ────────────────────────────────────────── */
const OfferLetter = ({ emp }) => (
  <LetterShell>
    <div style={{ textAlign: 'right', marginBottom: 24, fontSize: 13, color: '#475569', fontFamily: 'sans-serif' }}>
      Ref: {COLLEGE_NAME.substring(0,3).toUpperCase()}/HR/OFFER/{new Date().getFullYear()}/{emp.employeeCode || '----'}<br />
      Date: {todayFmt()}
    </div>
    <div style={{ fontFamily: 'sans-serif', marginBottom: 24 }}>
      <strong>To,</strong><br />
      {emp.firstName} {emp.lastName}<br />
      {emp.address || 'Address on file'}<br />
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', textDecoration: 'underline', marginBottom: 24, fontFamily: 'sans-serif' }}>
      OFFER OF EMPLOYMENT
    </div>
    <p>Dear <strong>{emp.firstName} {emp.lastName}</strong>,</p>
    <p>
      We are pleased to offer you the position of <strong>{emp.designation}</strong> in the 
      <strong> {emp.department?.name || emp.department || 'Department'}</strong> at <em>{COLLEGE_NAME}</em>.
      This offer is contingent upon the successful completion of your joining formalities.
    </p>
    <p>The salient terms of your employment are as follows:</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontFamily: 'sans-serif', fontSize: 13 }}>
      <tbody>
        {[
          ['Designation',         emp.designation],
          ['Department',          emp.department?.name || emp.department || 'N/A'],
          ['Employee Type',       emp.employeeType?.replace('_', ' ')],
          ['Contract Type',       emp.contractType || 'Permanent'],
          ['Date of Joining',     fmt(emp.joiningDate)],
          ['Basic Salary',        fmtSalary(emp.basicSalary) + ' per month'],
          ['HRA',                 fmtSalary(emp.hra) + ' per month'],
          ['DA',                  fmtSalary(emp.da) + ' per month'],
          ['Gross CTC',           fmtSalary((emp.basicSalary||0)+(emp.hra||0)+(emp.da||0)+(emp.ta||0)+(emp.bonus||0)+(emp.otherAllowances||0)) + ' per month'],
        ].map(([k, v]) => (
          <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '7px 10px', fontWeight: 600, color: '#374151', width: '40%' }}>{k}</td>
            <td style={{ padding: '7px 10px', color: '#1e293b' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p>
      Kindly confirm your acceptance of this offer by signing and returning a copy of this letter on or before your 
      date of joining. We look forward to having you on our team.
    </p>
    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 180, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>HR Manager</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{COLLEGE_NAME}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 180, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Principal / Director</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{COLLEGE_NAME}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 180, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Signature (Candidate)</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Date: ________________</div>
      </div>
    </div>
  </LetterShell>
);

const AppointmentLetter = ({ emp }) => (
  <LetterShell>
    <div style={{ textAlign: 'right', marginBottom: 24, fontSize: 13, color: '#475569', fontFamily: 'sans-serif' }}>
      Ref: {COLLEGE_NAME.substring(0,3).toUpperCase()}/HR/APPT/{new Date().getFullYear()}/{emp.employeeCode || '----'}<br />
      Date: {todayFmt()}
    </div>
    <div style={{ fontFamily: 'sans-serif', marginBottom: 24 }}>
      <strong>To,</strong><br />
      {emp.firstName} {emp.lastName}<br />
      Employee Code: <strong>{emp.employeeCode || 'N/A'}</strong>
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', textDecoration: 'underline', marginBottom: 24, fontFamily: 'sans-serif' }}>
      LETTER OF APPOINTMENT
    </div>
    <p>Dear <strong>{emp.firstName} {emp.lastName}</strong>,</p>
    <p>
      With reference to your application and subsequent interview, we are pleased to appoint you as 
      <strong> {emp.designation}</strong> in the <strong>{emp.department?.name || emp.department || 'Department'}</strong> 
      of {COLLEGE_NAME}, with effect from <strong>{fmt(emp.joiningDate)}</strong>.
    </p>
    <p>Your appointment shall be governed by the following terms and conditions:</p>
    <ol style={{ paddingLeft: 20, fontFamily: 'sans-serif', fontSize: 13 }}>
      <li style={{ marginBottom: 8 }}>
        <strong>Designation & Department:</strong> You will serve as <em>{emp.designation}</em> in the 
        {emp.department?.name || emp.department || 'assigned'} Department.
      </li>
      <li style={{ marginBottom: 8 }}>
        <strong>Nature of Appointment:</strong> {emp.contractType || 'Permanent'} appointment as {emp.employeeType?.replace('_', ' ')} staff.
      </li>
      <li style={{ marginBottom: 8 }}>
        <strong>Remuneration:</strong> You will be entitled to a monthly gross salary of{' '}
        <strong>{fmtSalary((emp.basicSalary||0)+(emp.hra||0)+(emp.da||0)+(emp.ta||0)+(emp.bonus||0)+(emp.otherAllowances||0))}</strong> 
        {' '}(inclusive of Basic: {fmtSalary(emp.basicSalary)}, HRA: {fmtSalary(emp.hra)}, DA: {fmtSalary(emp.da)}, TA: {fmtSalary(emp.ta)}).
      </li>
      <li style={{ marginBottom: 8 }}>
        <strong>Deductions:</strong> Statutory deductions including PF ({fmtSalary(emp.pfDeduction)}), ESI ({fmtSalary(emp.esiDeduction)}), 
        and Income Tax ({fmtSalary(emp.taxDeduction)}) shall be deducted as per applicable law.
      </li>
      <li style={{ marginBottom: 8 }}>
        <strong>Code of Conduct:</strong> You are expected to adhere to the institutional policies and maintain professional conduct at all times.
      </li>
      <li style={{ marginBottom: 8 }}>
        <strong>Notice Period:</strong> Either party may terminate this appointment by giving one month's notice in writing.
      </li>
    </ol>
    <p>Please sign and return the duplicate copy of this letter as a token of your acceptance.</p>
    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 180, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Authorised Signatory</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>HR Department</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 180, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Employee Signature</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Date: ________________</div>
      </div>
    </div>
  </LetterShell>
);

const RelievingLetter = ({ emp }) => (
  <LetterShell>
    <div style={{ textAlign: 'right', marginBottom: 24, fontSize: 13, color: '#475569', fontFamily: 'sans-serif' }}>
      Ref: {COLLEGE_NAME.substring(0,3).toUpperCase()}/HR/REL/{new Date().getFullYear()}/{emp.employeeCode || '----'}<br />
      Date: {todayFmt()}
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', textDecoration: 'underline', marginBottom: 24, fontFamily: 'sans-serif' }}>
      RELIEVING LETTER
    </div>
    <p style={{ fontFamily: 'sans-serif' }}>
      <strong>Employee Name:</strong> {emp.firstName} {emp.lastName} &nbsp;&nbsp;
      <strong>Employee Code:</strong> {emp.employeeCode || 'N/A'}
    </p>
    <p>To Whom It May Concern,</p>
    <p>
      This is to certify that <strong>{emp.firstName} {emp.lastName}</strong>, bearing Employee Code 
      <strong> {emp.employeeCode || 'N/A'}</strong>, was employed as <strong>{emp.designation}</strong> in the 
      <strong> {emp.department?.name || emp.department || 'Department'}</strong> of {COLLEGE_NAME}.
    </p>
    <p>
      {emp.firstName} joined us on <strong>{fmt(emp.joiningDate)}</strong> and 
      {emp.relievingDate ? (
        <> was relieved from services on <strong>{fmt(emp.relievingDate)}</strong>, 
        serving the institution for <strong>{yearsDiff(emp.joiningDate, emp.relievingDate)}</strong>.</>
      ) : (
        <> last working date is yet to be confirmed.</>
      )}
    </p>
    <p>
      During the tenure with us, {emp.firstName} has discharged the assigned duties sincerely and diligently. 
      We have no dues pending against {emp.firstName} and the relieving is being effected at {emp.firstName}'s 
      own request / under mutual agreement.
    </p>
    <p>
      We wish {emp.firstName} all the best in future endeavours.
    </p>
    <div style={{ marginTop: 48, fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ borderTop: '1px solid #374151', width: 200, marginBottom: 4 }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Authorised Signatory</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>HR Manager / Principal</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{COLLEGE_NAME}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Date: {todayFmt()}</div>
      </div>
    </div>
  </LetterShell>
);

const ContractLetter = ({ emp }) => (
  <LetterShell>
    <div style={{ textAlign: 'right', marginBottom: 24, fontSize: 13, color: '#475569', fontFamily: 'sans-serif' }}>
      Ref: {COLLEGE_NAME.substring(0,3).toUpperCase()}/HR/CONTRACT/{new Date().getFullYear()}/{emp.employeeCode || '----'}<br />
      Date: {todayFmt()}
    </div>
    <div style={{ fontFamily: 'sans-serif', marginBottom: 24 }}>
      <strong>To,</strong><br />
      {emp.firstName} {emp.lastName}<br />
      Employee Code: <strong>{emp.employeeCode || 'N/A'}</strong>
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', textDecoration: 'underline', marginBottom: 24, fontFamily: 'sans-serif' }}>
      CONTRACT OF EMPLOYMENT
    </div>
    <p>Dear <strong>{emp.firstName} {emp.lastName}</strong>,</p>
    <p>
      This contract of employment is entered into between <strong>{COLLEGE_NAME}</strong> (hereinafter referred to as 
      "the Institution") and <strong>{emp.firstName} {emp.lastName}</strong> (hereinafter referred to as "the Employee"), 
      with effect from <strong>{fmt(emp.joiningDate)}</strong>.
    </p>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontFamily: 'sans-serif', fontSize: 13, border: '1px solid #e2e8f0' }}>
      <thead>
        <tr style={{ background: '#f0edff' }}>
          <th style={{ padding: '8px 12px', textAlign: 'left', color: '#4318FF', borderBottom: '2px solid #c4b5fd' }}>Term</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', color: '#4318FF', borderBottom: '2px solid #c4b5fd' }}>Details</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['Position',           emp.designation],
          ['Department',         emp.department?.name || emp.department || 'N/A'],
          ['Contract Type',      emp.contractType || 'Permanent'],
          ['Contract Start',     fmt(emp.joiningDate)],
          ['Contract End',       emp.contractEndDate ? fmt(emp.contractEndDate) : 'Permanent / Until Notice'],
          ['Probation Period',   emp.probationEndDate ? `Until ${fmt(emp.probationEndDate)}` : 'Not Applicable'],
          ['Gross Monthly CTC',  fmtSalary((emp.basicSalary||0)+(emp.hra||0)+(emp.da||0)+(emp.ta||0)+(emp.bonus||0)+(emp.otherAllowances||0))],
          ['Working Hours',      '9:00 AM – 5:00 PM, Monday to Saturday'],
          ['Governing Law',      'Laws of India'],
        ].map(([k, v]) => (
          <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '7px 12px', fontWeight: 600, color: '#374151' }}>{k}</td>
            <td style={{ padding: '7px 12px', color: '#1e293b' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'sans-serif' }}>
      Both parties agree to the terms and conditions set forth in this contract and any policies issued by the Institution from time to time.
    </p>
    <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 200, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Authorised Representative</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{COLLEGE_NAME}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #374151', width: 200, margin: '0 auto 4px' }}></div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Employee Signature</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Date: ________________</div>
      </div>
    </div>
  </LetterShell>
);

const ExperienceLetter = ({ emp }) => (
  <LetterShell>
    <div style={{ textAlign: 'right', marginBottom: 24, fontSize: 13, color: '#475569', fontFamily: 'sans-serif' }}>
      Ref: {COLLEGE_NAME.substring(0,3).toUpperCase()}/HR/EXP/{new Date().getFullYear()}/{emp.employeeCode || '----'}<br />
      Date: {todayFmt()}
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', textDecoration: 'underline', marginBottom: 24, fontFamily: 'sans-serif' }}>
      EXPERIENCE / SERVICE CERTIFICATE
    </div>
    <p>To Whom It May Concern,</p>
    <p>
      This is to certify that <strong>{emp.firstName} {emp.lastName}</strong> (Employee Code: <strong>{emp.employeeCode || 'N/A'}</strong>) 
      has been associated with <strong>{COLLEGE_NAME}</strong> as <strong>{emp.designation}</strong> in the 
      <strong> {emp.department?.name || emp.department || 'Department'}</strong>.
    </p>
    <p>
      {emp.firstName} joined the institution on <strong>{fmt(emp.joiningDate)}</strong>
      {emp.relievingDate ? (
        <> and served until <strong>{fmt(emp.relievingDate)}</strong>, 
        for a total period of <strong>{yearsDiff(emp.joiningDate, emp.relievingDate)}</strong>.</>
      ) : (
        <> and continues to serve as of the date of this certificate, 
        with a total service period of <strong>{yearsDiff(emp.joiningDate)}</strong> (as on {todayFmt()}).</>
      )}
    </p>
    <p>
      During this tenure, <strong>{emp.firstName}</strong> demonstrated excellent professional skills, 
      commitment to institutional values, and maintained a satisfactory performance record. 
      {emp.firstName} handled responsibilities with due diligence and professional integrity.
    </p>
    <p>
      This certificate is issued at the request of <strong>{emp.firstName} {emp.lastName}</strong> for whatever 
      purpose it may serve. We wish {emp.firstName} continued success in all future pursuits.
    </p>
    <div style={{ marginTop: 48, fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ borderTop: '1px solid #374151', width: 220, marginBottom: 4 }}></div>
        <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Authorised Signatory</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>HR Manager / Principal</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{COLLEGE_NAME}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Contact: {COLLEGE_EMAIL}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>Date: {todayFmt()}</div>
      </div>
    </div>
  </LetterShell>
);

/* ─── Letter Renderer Map ────────────────────────────────────────────────── */
const TEMPLATES = {
  offer:       OfferLetter,
  appointment: AppointmentLetter,
  relieving:   RelievingLetter,
  contract:    ContractLetter,
  experience:  ExperienceLetter,
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main EmployeeLetters Component
═══════════════════════════════════════════════════════════════════════════ */
const EmployeeLetters = ({ show, onHide, employee }) => {
  const [selectedType, setSelectedType] = useState('offer');
  const printRef = useRef(null);

  const emp = employee || {};
  const LetterComponent = TEMPLATES[selectedType];
  const selected = LETTER_TYPES.find(t => t.key === selectedType);

  const handlePrint = () => {
    const content = document.getElementById('letter-print-area');
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selected.label} — ${emp.firstName} ${emp.lastName}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; 
                 line-height: 1.7; color: #1a1a1a; background: #fff; padding: 20px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; size: A4 portrait; }
          }
        </style>
      </head>
      <body>${content.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      {/* Header */}
      <Modal.Header closeButton className="border-0 p-4"
        style={{ background: 'linear-gradient(135deg,#1e1b4b,#4338ca)' }}>
        <Modal.Title className="text-white fw-bold">
          <i className="bi bi-file-earmark-text-fill me-2"></i>
          Letters — {emp.firstName} {emp.lastName}
          <Badge bg="light" text="dark" className="ms-3" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {emp.employeeCode || 'No Code'}
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0" style={{ background: '#f8fafc', minHeight: 600 }}>
        <Row className="g-0" style={{ height: '100%' }}>

          {/* ── Left Sidebar: Letter Selector ── */}
          <Col md={3} style={{ background: '#fff', borderRight: '1px solid #e2e8f0', minHeight: 600 }}>
            <div className="p-3">
              <div className="text-muted small fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.8px', fontSize: '0.72rem' }}>
                Select Letter Type
              </div>

              {LETTER_TYPES.map(lt => (
                <button
                  key={lt.key}
                  onClick={() => setSelectedType(lt.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 14px',
                    marginBottom: 6,
                    borderRadius: 12,
                    border: selectedType === lt.key ? `2px solid ${lt.color}` : '2px solid transparent',
                    background: selectedType === lt.key ? lt.bg : '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: selectedType === lt.key ? lt.color : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}>
                    <i className={`bi ${lt.icon}`} style={{ color: selectedType === lt.key ? '#fff' : '#94a3b8', fontSize: '1rem' }}></i>
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700, fontSize: '0.82rem',
                      color: selectedType === lt.key ? lt.color : '#374151',
                    }}>
                      {lt.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Click to preview</div>
                  </div>
                </button>
              ))}

              {/* Employee Quick Info */}
              <div style={{ marginTop: 16, padding: 14, background: '#f0edff', borderRadius: 12 }}>
                <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.8rem' }}>
                  <i className="bi bi-person-fill me-1" style={{ color: '#4318FF' }}></i> Employee Info
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.8 }}>
                  <div><strong>Dept:</strong> {emp.department?.name || emp.department || 'N/A'}</div>
                  <div><strong>Type:</strong> {emp.employeeType?.replace('_', ' ') || 'N/A'}</div>
                  <div><strong>Joined:</strong> {fmt(emp.joiningDate)}</div>
                  {emp.relievingDate && <div><strong>Relieved:</strong> {fmt(emp.relievingDate)}</div>}
                  <div><strong>Status:</strong> {emp.status || 'N/A'}</div>
                </div>
              </div>
            </div>
          </Col>

          {/* ── Right: Letter Preview ── */}
          <Col md={9}>
            {/* Toolbar */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom"
                 style={{ background: '#fff' }}>
              <div className="d-flex align-items-center gap-2">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`bi ${selected.icon} text-white`} style={{ fontSize: '0.85rem' }}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{selected.label}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Live preview · A4 format</div>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                className="rounded-pill px-4 fw-bold shadow-sm"
                style={{ background: selected.color, border: 'none', fontSize: '0.85rem' }}
              >
                <i className="bi bi-printer-fill me-2"></i> Print / Download PDF
              </Button>
            </div>

            {/* Letter Preview */}
            <div style={{ padding: '24px 20px', overflowY: 'auto', maxHeight: 680 }}>
              <LetterComponent emp={emp} />
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light p-3 d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          <i className="bi bi-info-circle me-1"></i>
          Use <strong>Print → Save as PDF</strong> to download the letter as a PDF document.
        </div>
        <Button variant="light" className="rounded-pill px-4 border" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmployeeLetters;
