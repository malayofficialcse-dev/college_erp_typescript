import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : '0.0');
const fmtCur = (n) => `₹${fmt(n)}`;

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

/* ─── Stat card ─────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, sub, icon, color, delta }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: '20px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,.07)', display: 'flex', gap: 16,
    alignItems: 'flex-start', border: '1px solid #f3f4f6',
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14, background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <i className={`bi ${icon}`} style={{ fontSize: 22, color }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1.2, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 6, fontSize: 12, fontWeight: 600,
          color: delta >= 0 ? '#10b981' : '#ef4444',
        }}>
          <i className={`bi bi-arrow-${delta >= 0 ? 'up' : 'down'}-right`} />
          {Math.abs(delta)}% vs last period
        </div>
      )}
    </div>
  </div>
);

/* ─── Horizontal bar ─────────────────────────────────────────────────────────── */
const HBar = ({ label, value, max, color, suffix = '' }) => {
  const width = max ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{label}</span>
        <span style={{ color: '#6b7280', fontWeight: 600, flexShrink: 0 }}>{fmt(value)}{suffix}</span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99 }}>
        <div style={{ height: 8, width: `${width}%`, background: color, borderRadius: 99, transition: 'width .6s ease' }} />
      </div>
    </div>
  );
};

/* ─── Donut chart (SVG) ─────────────────────────────────────────────────────── */
const Donut = ({ segments, size = 120, stroke = 22 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {total > 0 && segments.map((seg, i) => {
        const arc = (seg.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray .6s ease' }}
          />
        );
        offset += arc;
        return el;
      })}
    </svg>
  );
};

/* ─── Vertical Bar Chart (SVG) ──────────────────────────────────────────────── */
const BarChart = ({ data, height = 200, color = '#6366f1', multiColor = false, labelKey = 'label', valueKey = 'value', formatValue, yLabel }) => {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return <div className="text-muted text-center py-4">No data</div>;
  const W = 600, H = height, PAD = { top: 20, right: 16, bottom: 52, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  const barW = Math.min(Math.floor(innerW / data.length) - 6, 56);
  const step = innerW / data.length;
  const fmtV = formatValue || ((v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}k` : fmt(v));

  // Y-axis grid lines
  const yTicks = 5;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (max / yTicks) * i;
    const y = innerH - (val / max) * innerH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        {data.map((d, i) => {
          const c = multiColor ? COLORS[i % COLORS.length] : color;
          return (
            <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="1" />
              <stop offset="100%" stopColor={c} stopOpacity="0.65" />
            </linearGradient>
          );
        })}
      </defs>

      {/* Y-axis grid */}
      {yLines.map((line, i) => (
        <g key={i} transform={`translate(${PAD.left},${PAD.top})`}>
          <line x1={0} y1={line.y} x2={innerW} y2={line.y} stroke="#f3f4f6" strokeWidth={1} />
          <text x={-8} y={line.y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{fmtV(line.val)}</text>
        </g>
      ))}

      {/* Y-axis label */}
      {yLabel && (
        <text transform={`translate(12,${H/2}) rotate(-90)`} textAnchor="middle" fontSize={10} fill="#9ca3af">{yLabel}</text>
      )}

      {/* Bars */}
      {data.map((d, i) => {
        const c = multiColor ? COLORS[i % COLORS.length] : color;
        const val = d[valueKey] || 0;
        const barH = Math.max((val / max) * innerH, 2);
        const x = PAD.left + i * step + (step - barW) / 2;
        const y = PAD.top + innerH - barH;
        const isHov = hovered === i;
        return (
          <g key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Bar shadow on hover */}
            {isHov && <rect x={x - 2} y={y - 2} width={barW + 4} height={barH + 4} rx={7} fill={c} opacity={0.15} />}
            <rect
              x={x} y={y} width={barW} height={barH} rx={5}
              fill={`url(#barGrad-${i})`}
              style={{ transition: 'y .3s, height .3s' }}
            />
            {/* Value label on bar top */}
            <text
              x={x + barW / 2} y={y - 5}
              textAnchor="middle" fontSize={10}
              fill={isHov ? c : '#9ca3af'}
              fontWeight={isHov ? 700 : 400}
            >
              {fmtV(val)}
            </text>
            {/* X axis label */}
            <foreignObject x={x - 8} y={PAD.top + innerH + 6} width={barW + 16} height={44}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{
                fontSize: 10, color: isHov ? '#111827' : '#6b7280', fontWeight: isHov ? 700 : 400,
                textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.3,
              }}>
                {d[labelKey]}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* X axis line */}
      <line
        x1={PAD.left} y1={PAD.top + innerH}
        x2={PAD.left + innerW} y2={PAD.top + innerH}
        stroke="#e5e7eb" strokeWidth={1.5}
      />
    </svg>
  );
};

/* ─── Grouped Bar Chart (SVG) ─────────────────────────────────────────────── */
const GroupedBarChart = ({ data, series, height = 220, labelKey = 'label' }) => {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0 || !series || series.length === 0) return <div className="text-muted text-center py-4">No data</div>;
  const W = 600, H = height, PAD = { top: 20, right: 16, bottom: 52, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const allVals = data.flatMap(d => series.map(s => d[s.key] || 0));
  const max = Math.max(...allVals, 1);
  const groupW = innerW / data.length;
  const barW = Math.min(Math.floor(groupW / series.length) - 3, 28);

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (max / yTicks) * i;
    const y = innerH - (val / max) * innerH;
    return { val, y };
  });
  const fmtV = (v) => v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : fmt(v);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
        {yLines.map((line, i) => (
          <g key={i} transform={`translate(${PAD.left},${PAD.top})`}>
            <line x1={0} y1={line.y} x2={innerW} y2={line.y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={-6} y={line.y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{fmtV(line.val)}</text>
          </g>
        ))}
        {data.map((d, gi) => {
          const gx = PAD.left + gi * groupW;
          return (
            <g key={gi}>
              {series.map((s, si) => {
                const val = d[s.key] || 0;
                const bH = Math.max((val / max) * innerH, 1);
                const bx = gx + (groupW - series.length * (barW + 2)) / 2 + si * (barW + 2);
                const by = PAD.top + innerH - bH;
                const isHov = hovered === `${gi}-${si}`;
                return (
                  <g key={si}
                    onMouseEnter={() => setHovered(`${gi}-${si}`)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x={bx} y={by} width={barW} height={bH} rx={4} fill={s.color} opacity={isHov ? 1 : 0.8} />
                    {isHov && (
                      <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fontSize={9} fill={s.color} fontWeight={700}>{fmtV(val)}</text>
                    )}
                  </g>
                );
              })}
              <foreignObject x={gx} y={PAD.top + innerH + 6} width={groupW} height={40}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.3 }}>{d[labelKey]}</div>
              </foreignObject>
            </g>
          );
        })}
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="#e5e7eb" strokeWidth={1.5} />
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        {series.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Area / Line Chart (SVG) ─────────────────────────────────────────────── */
const AreaChart = ({ data, height = 180, color = '#6366f1', labelKey = 'label', valueKey = 'value', formatValue, gradientId }) => {
  const [hovered, setHovered] = useState(null);
  const uid = gradientId || `areaGrad-${color.replace('#','')}`;
  if (!data || data.length === 0) return <div className="text-muted text-center py-4">No data</div>;
  const W = 600, H = height, PAD = { top: 20, right: 16, bottom: 36, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  const fmtV = formatValue || ((v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}k` : String(v));

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1 || 1)) * innerW,
    y: PAD.top + innerH - ((d[valueKey] || 0) / max) * innerH,
    val: d[valueKey] || 0,
    label: d[labelKey],
  }));

  // Smooth cubic bezier path
  const linePath = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 3;
    const cy1 = prev.y;
    const cx2 = p.x - (p.x - prev.x) / 3;
    const cy2 = p.y;
    return `C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }).join(' ');

  const areaPath = `${linePath} L ${pts[pts.length-1].x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`;

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (max / yTicks) * i;
    const y = PAD.top + innerH - (val / max) * innerH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yLines.map((line, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={line.y} x2={PAD.left + innerW} y2={line.y} stroke="#f3f4f6" strokeWidth={1} />
          <text x={PAD.left - 6} y={line.y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{fmtV(line.val)}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${uid})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Points + tooltip */}
      {pts.map((p, i) => (
        <g key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4} fill={hovered === i ? color : '#fff'} stroke={color} strokeWidth={2} style={{ transition: 'r .15s' }} />
          {hovered === i && (
            <g>
              <rect
                x={p.x - 32} y={p.y - 30}
                width={64} height={22} rx={6}
                fill="#1f2937" opacity={0.9}
              />
              <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={700}>{fmtV(p.val)}</text>
            </g>
          )}
          {/* X label */}
          <text x={p.x} y={PAD.top + innerH + 16} textAnchor="middle" fontSize={9} fill="#9ca3af"
            style={{ transform: data.length > 8 ? `rotate(-30deg)` : undefined }}>
            {p.label}
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="#e5e7eb" strokeWidth={1.5} />
    </svg>
  );
};

/* ─── Section wrapper ─────────────────────────────────────────────────────────── */
const Section = ({ title, icon, children, action }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,.07)', border: '1px solid #f3f4f6', height: '100%',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#f0f4ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`bi ${icon}`} style={{ color: '#6366f1', fontSize: 16 }} />
        </div>
        <h6 style={{ fontWeight: 700, margin: 0, color: '#111827', fontSize: 15 }}>{title}</h6>
      </div>
      {action}
    </div>
    {children}
  </div>
);

/* ─── Tab bar ─────────────────────────────────────────────────────────────────── */
const tabs = [
  { key: 'overview', label: 'Overview', icon: 'bi-grid-fill' },
  { key: 'attendance', label: 'Attendance', icon: 'bi-calendar-check-fill' },
  { key: 'employees', label: 'Employees', icon: 'bi-people-fill' },
  { key: 'finance', label: 'Finance', icon: 'bi-cash-stack' },
  { key: 'academic', label: 'Academic', icon: 'bi-mortarboard-fill' },
];

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [overview, setOverview] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [
        empRes, deptRes, teachRes, studRes, attRes, feeRes, admRes, subRes
      ] = await Promise.allSettled([
        api.get('/employees', { params: { size: 1000 }, transformResponse: [d => d] }),
        api.get('/departments'),
        api.get('/teachers', { params: { size: 1000 } }),
        api.get('/students', { params: { size: 1000 } }),
        api.get('/attendance', { params: { size: 1000 } }),
        api.get('/fees', { params: { size: 1000 } }),
        api.get('/admissions', { params: { size: 1000 } }),
        api.get('/subjects', { params: { size: 1000 } }),
      ]);

      const safe = (r) => {
        if (r.status !== 'fulfilled') return [];
        const raw = typeof r.value.data === 'string' ? JSON.parse(r.value.data) : r.value.data;
        return Array.isArray(raw) ? raw : (raw?.content || raw?.data || []);
      };

      const empArr   = safe(empRes);
      const deptArr  = safe(deptRes);
      const teachArr = safe(teachRes);
      const studArr  = safe(studRes);
      const attArr   = safe(attRes);
      const feeArr   = safe(feeRes);
      const admArr   = safe(admRes);
      const subArr   = safe(subRes);

      setEmployees(empArr);
      setDepartments(deptArr);
      setTeachers(teachArr);
      setStudents(studArr);
      setAttendance(attArr);
      setFees(feeArr);
      setAdmissions(admArr);
      setSubjects(subArr);

      setOverview({
        totalEmployees: empArr.length,
        totalTeachers: teachArr.length,
        totalStudents: studArr.length,
        totalDepartments: deptArr.length,
        activeEmployees: empArr.filter(e => e.status === 'ACTIVE').length,
        totalSubjects: subArr.length,
        totalAdmissions: admArr.length,
        totalAttendance: attArr.length,
      });
    } catch (err) {
      console.error('fetchAll error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Derived analytics ─────────────────────────────────────────────────────── */

  // Attendance
  const attByStatus = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
  attendance.forEach(a => { if (attByStatus[a.status] !== undefined) attByStatus[a.status]++; });
  const totalAtt = attendance.length;
  const attPct = pct(attByStatus.PRESENT, totalAtt);

  // Attendance by subject (top 8)
  const attBySubject = {};
  attendance.forEach(a => {
    const name = a.subject?.subjectName || a.subject?.name || 'Unknown';
    if (!attBySubject[name]) attBySubject[name] = { total: 0, present: 0 };
    attBySubject[name].total++;
    if (a.status === 'PRESENT') attBySubject[name].present++;
  });
  const attSubjectRows = Object.entries(attBySubject)
    .map(([k, v]) => ({ name: k, ...v, pct: pct(v.present, v.total) }))
    .sort((a, b) => b.total - a.total).slice(0, 8);

  // Employee type breakdown
  const empByType = {};
  employees.forEach(e => { empByType[e.employeeType || 'UNKNOWN'] = (empByType[e.employeeType || 'UNKNOWN'] || 0) + 1; });

  // Employee status breakdown
  const empByStatus = {};
  employees.forEach(e => { empByStatus[e.status || 'UNKNOWN'] = (empByStatus[e.status || 'UNKNOWN'] || 0) + 1; });

  // Department-wise employee count
  const empByDept = {};
  employees.forEach(e => {
    const name = e.department?.name || 'No Dept';
    empByDept[name] = (empByDept[name] || 0) + 1;
  });
  const empDeptRows = Object.entries(empByDept).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxEmpDept = Math.max(...empDeptRows.map(r => r[1]), 1);

  // Salary analytics
  const totalSalary = employees.reduce((s, e) => s + (e.basicSalary || 0) + (e.hra || 0) + (e.da || 0) + (e.ta || 0) + (e.bonus || 0) + (e.otherAllowances || 0), 0);
  const totalDeductions = employees.reduce((s, e) => s + (e.pfDeduction || 0) + (e.taxDeduction || 0) + (e.esiDeduction || 0) + (e.otherDeductions || 0), 0);
  const netPayroll = totalSalary - totalDeductions;

  // Salary by department
  const salByDept = {};
  employees.forEach(e => {
    const name = e.department?.name || 'No Dept';
    salByDept[name] = (salByDept[name] || 0) + ((e.basicSalary || 0) + (e.hra || 0) + (e.da || 0));
  });
  const salDeptRows = Object.entries(salByDept).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSal = Math.max(...salDeptRows.map(r => r[1]), 1);

  // Fee analytics
  const feePaid = fees.filter(f => f.status === 'PAID');
  const feePending = fees.filter(f => f.status === 'PENDING' || f.status === 'UNPAID');
  const feePartial = fees.filter(f => f.status === 'PARTIAL');
  const totalFeeCollected = feePaid.reduce((s, f) => s + (f.amountPaid || f.amount || 0), 0);
  const totalFeePending = feePending.reduce((s, f) => s + (f.amount || 0), 0);

  // Admissions by status
  const admByStatus = {};
  admissions.forEach(a => { admByStatus[a.status || 'UNKNOWN'] = (admByStatus[a.status || 'UNKNOWN'] || 0) + 1; });

  // Students by dept
  const studByDept = {};
  students.forEach(s => {
    const name = s.department?.name || 'No Dept';
    studByDept[name] = (studByDept[name] || 0) + 1;
  });
  const studDeptRows = Object.entries(studByDept).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxStudDept = Math.max(...studDeptRows.map(r => r[1]), 1);

  // Teacher designations
  const teachByDes = {};
  teachers.forEach(t => { teachByDes[t.designation || 'Unknown'] = (teachByDes[t.designation || 'Unknown'] || 0) + 1; });
  const teachDesRows = Object.entries(teachByDes).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxTeachDes = Math.max(...teachDesRows.map(r => r[1]), 1);

  const TYPE_COLOR_MAP = { TEACHING: '#6366f1', NON_TEACHING: '#10b981', ADMIN: '#f59e0b', SUPPORT: '#06b6d4', UNKNOWN: '#9ca3af' };
  const STATUS_COLOR_MAP = { ACTIVE: '#10b981', INACTIVE: '#9ca3af', TERMINATED: '#ef4444', ON_LEAVE: '#f59e0b', RESIGNED: '#8b5cf6', RETIRED: '#ec4899' };
  const ATT_COLOR_MAP = { PRESENT: '#10b981', ABSENT: '#ef4444', LATE: '#f59e0b', EXCUSED: '#6366f1' };

  /* ── Chart-ready data arrays ───────────────────────────────────────────────── */

  // Dept-grouped chart: students vs employees vs teachers per dept
  const deptCompareData = departments.slice(0, 8).map(dept => {
    const dId = dept.id || dept._id;
    return {
      label: dept.name,
      students:  students.filter(s => (s.department?.id || s.department?._id || s.department) === dId).length,
      employees: employees.filter(e => (e.department?.id || e.department?._id || e.department) === dId).length,
      teachers:  teachers.filter(t => (t.department?.id || t.department?._id || t.department) === dId).length,
    };
  }).filter(d => d.students + d.employees + d.teachers > 0);

  // Attendance status bar chart
  const attStatusBarData = Object.entries(attByStatus).map(([k, v]) => ({
    label: k, value: v, color: ATT_COLOR_MAP[k],
  }));

  // Subject-wise attendance bar chart
  const attSubjectBarData = attSubjectRows.map(r => ({
    label: r.name, value: parseFloat(r.pct),
  }));

  // Employee type bar
  const empTypeBarData = Object.entries(empByType).map(([k, v]) => ({
    label: k.replace('_', ' '), value: v,
  }));

  // Employee dept bar
  const empDeptBarData = empDeptRows.map(([dept, cnt]) => ({ label: dept, value: cnt }));

  // Student dept bar
  const studDeptBarData = studDeptRows.map(([dept, cnt]) => ({ label: dept, value: cnt }));

  // Salary by dept bar
  const salDeptBarData = salDeptRows.map(([dept, amt]) => ({ label: dept, value: amt }));

  // Attendance area chart: group by date (last 30 days present counts)
  const attDateMap = {};
  attendance.forEach(a => {
    const raw = a.attendanceDate || a.date;
    if (!raw) return;
    const day = String(raw).slice(0, 10);
    if (!attDateMap[day]) attDateMap[day] = { present: 0, absent: 0, total: 0 };
    attDateMap[day].total++;
    if (a.status === 'PRESENT') attDateMap[day].present++;
    if (a.status === 'ABSENT')  attDateMap[day].absent++;
  });
  const attAreaData = Object.entries(attDateMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, v]) => ({
      label: date.slice(5), // MM-DD
      present: v.present,
      absent: v.absent,
      total: v.total,
    }));

  // Fee area chart: group by date (paid fees)
  const feeDateMap = {};
  fees.forEach(f => {
    const raw = f.paidDate || f.createdAt;
    if (!raw || f.status !== 'PAID') return;
    const month = String(raw).slice(0, 7); // YYYY-MM
    feeDateMap[month] = (feeDateMap[month] || 0) + (f.amountPaid || f.amount || 0);
  });
  const feeAreaData = Object.entries(feeDateMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, val]) => ({ label: month.slice(5), value: val })); // MM label

  // Payroll area: monthly salary (simulate from employee joining dates)
  const payAreaData = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ].map((m, i) => {
    const cnt = employees.filter(e => {
      if (!e.joiningDate) return false;
      const d = new Date(e.joiningDate);
      return d.getMonth() <= i;
    }).length;
    return { label: m, value: cnt > 0 ? Math.round(totalSalary * (cnt / Math.max(employees.length, 1))) : 0 };
  });

  /* ── render ────────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="spinner-border text-primary mb-3" />
        <div style={{ color: '#6b7280', fontWeight: 500 }}>Loading analytics…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, margin: 0, color: '#111827' }}>
            <i className="bi bi-bar-chart-line-fill me-2" style={{ color: '#6366f1' }} />
            Reports & Analytics
          </h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            Live institutional intelligence dashboard
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14,
            cursor: refreshing ? 'not-allowed' : 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}
        >
          <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f9fafb', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 9, border: 'none',
              background: activeTab === t.key ? '#fff' : 'transparent',
              color: activeTab === t.key ? '#6366f1' : '#6b7280',
              fontWeight: activeTab === t.key ? 700 : 500,
              fontSize: 13, cursor: 'pointer',
              boxShadow: activeTab === t.key ? '0 1px 6px rgba(0,0,0,.1)' : 'none',
              transition: 'all .15s',
            }}
          >
            <i className={`bi ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Total Students"    value={fmt(overview.totalStudents)}    icon="bi-person-graduation"      color="#6366f1" sub={`${fmt(admissions.filter(a=>a.status==='APPROVED').length)} active admissions`} />
            <KpiCard label="Total Employees"   value={fmt(overview.totalEmployees)}   icon="bi-people-fill"            color="#10b981" sub={`${fmt(overview.activeEmployees)} active`} />
            <KpiCard label="Teaching Staff"    value={fmt(overview.totalTeachers)}    icon="bi-person-workspace"       color="#f59e0b" sub={`${fmt(departments.length)} departments`} />
            <KpiCard label="Departments"       value={fmt(overview.totalDepartments)} icon="bi-building"               color="#8b5cf6" sub={`${fmt(overview.totalSubjects)} subjects`} />
            <KpiCard label="Attendance Records" value={fmt(overview.totalAttendance)} icon="bi-calendar-check-fill"    color="#06b6d4" sub={`${attPct}% present rate`} />
            <KpiCard label="Total Admissions"  value={fmt(overview.totalAdmissions)}  icon="bi-person-plus-fill"       color="#ec4899" sub={`${fmt(admissions.filter(a=>a.status==='PENDING').length)} pending`} />
            <KpiCard label="Fee Collected"     value={fmtCur(totalFeeCollected)}      icon="bi-cash-coin"              color="#14b8a6" sub={`${fmt(feePaid.length)} paid records`} />
            <KpiCard label="Net Payroll"       value={fmtCur(netPayroll)}             icon="bi-wallet2"                color="#f97316" sub={`Total gross: ${fmtCur(totalSalary)}`} />
          </div>

          {/* 2-column charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Attendance donut */}
            <Section title="Attendance Breakdown" icon="bi-pie-chart-fill">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Donut size={130} stroke={24} segments={Object.entries(attByStatus).map(([k,v],i)=>({ value:v, color: ATT_COLOR_MAP[k] || COLORS[i] }))} />
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>{attPct}%</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>PRESENT</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {Object.entries(attByStatus).map(([k, v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background: ATT_COLOR_MAP[k], flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:13, color:'#374151' }}>{k}</span>
                      <span style={{ fontWeight:700, fontSize:13 }}>{fmt(v)}</span>
                      <span style={{ fontSize:11, color:'#9ca3af', minWidth:38, textAlign:'right' }}>{pct(v,totalAtt)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Employee type donut */}
            <Section title="Employee Type Distribution" icon="bi-diagram-3-fill">
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Donut size={130} stroke={24} segments={Object.entries(empByType).map(([k,v],i)=>({ value:v, color: TYPE_COLOR_MAP[k]||COLORS[i] }))} />
                <div style={{ flex: 1 }}>
                  {Object.entries(empByType).map(([k, v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background: TYPE_COLOR_MAP[k]||'#9ca3af', flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:12, color:'#374151' }}>{k.replace('_',' ')}</span>
                      <span style={{ fontWeight:700, fontSize:13 }}>{fmt(v)}</span>
                      <span style={{ fontSize:11, color:'#9ca3af', minWidth:38, textAlign:'right' }}>{pct(v,employees.length)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Department grouped bar chart */}
          <div style={{ marginBottom: 16 }}>
            <Section title="Dept-wise: Students vs Employees vs Teachers" icon="bi-bar-chart-fill">
              <GroupedBarChart
                data={deptCompareData}
                labelKey="label"
                height={220}
                series={[
                  { key: 'students',  label: 'Students',  color: '#6366f1' },
                  { key: 'employees', label: 'Employees', color: '#10b981' },
                  { key: 'teachers',  label: 'Teachers',  color: '#f59e0b' },
                ]}
              />
            </Section>
          </div>

          {/* Student dept bar + attendance area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Section title="Students by Department" icon="bi-person-graduation">
              <BarChart data={studDeptBarData} height={220} multiColor color="#6366f1" />
            </Section>
            <Section title="Attendance Trend (last 30 days)" icon="bi-graph-up">
              {attAreaData.length === 0
                ? <div className="text-muted text-center py-3">No attendance date data</div>
                : <AreaChart data={attAreaData} height={220} color="#10b981" labelKey="label" valueKey="present" gradientId="attGrad" formatValue={v => String(v)} />
              }
            </Section>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ATTENDANCE TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {Object.entries(attByStatus).map(([k, v], i) => (
              <KpiCard key={k} label={k} value={fmt(v)} icon={k==='PRESENT'?'bi-check-circle-fill':k==='ABSENT'?'bi-x-circle-fill':k==='LATE'?'bi-clock-fill':'bi-shield-check'} color={ATT_COLOR_MAP[k]} sub={`${pct(v,totalAtt)}% of total`} />
            ))}
          </div>
          {/* Area chart – attendance trend */}
          <div style={{ marginBottom: 16 }}>
            <Section title="Daily Attendance Trend (last 30 days)" icon="bi-graph-up-arrow">
              {attAreaData.length === 0
                ? <div className="text-muted text-center py-3">No date-stamped attendance records found</div>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginBottom: 6 }}>✓ Present per day</div>
                      <AreaChart data={attAreaData} height={160} color="#10b981" labelKey="label" valueKey="present" gradientId="attGrad1" formatValue={v => String(v)} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>✗ Absent per day</div>
                      <AreaChart data={attAreaData} height={160} color="#ef4444" labelKey="label" valueKey="absent" gradientId="attGrad2" formatValue={v => String(v)} />
                    </div>
                  </div>
                )
              }
            </Section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Subject attendance bar chart */}
            <Section title="Subject-wise Attendance %" icon="bi-bar-chart-fill">
              {attSubjectBarData.length === 0
                ? <div className="text-muted text-center py-3">No attendance data</div>
                : <BarChart data={attSubjectBarData} height={220} color="#6366f1" yLabel="%"
                    formatValue={v => `${v}%`} />
              }
            </Section>

            {/* Donut + stat grid */}
            <Section title="Attendance Status Summary" icon="bi-clipboard-data-fill">
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <Donut size={130} stroke={24} segments={Object.entries(attByStatus).map(([k,v])=>({ value:v, color:ATT_COLOR_MAP[k] }))} />
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ fontWeight:900, fontSize:22 }}>{attPct}%</div>
                    <div style={{ fontSize:10, color:'#9ca3af', fontWeight:700 }}>PRESENT</div>
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  {Object.entries(attByStatus).map(([k,v]) => (
                    <div key={k} style={{ background:`${ATT_COLOR_MAP[k]}10`, border:`1px solid ${ATT_COLOR_MAP[k]}30`, borderRadius:10, padding:'8px 12px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:12, fontWeight:600, color: ATT_COLOR_MAP[k] }}>{k}</span>
                      <span style={{ fontWeight:800, color: ATT_COLOR_MAP[k] }}>{fmt(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EMPLOYEES TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'employees' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Total Employees" value={fmt(employees.length)} icon="bi-people-fill" color="#6366f1" />
            <KpiCard label="Active"          value={fmt(empByStatus.ACTIVE||0)} icon="bi-person-check-fill" color="#10b981" sub={`${pct(empByStatus.ACTIVE||0,employees.length)}% of total`} />
            <KpiCard label="Gross Payroll"   value={fmtCur(totalSalary)} icon="bi-cash-stack" color="#f59e0b" />
            <KpiCard label="Net Payroll"     value={fmtCur(netPayroll)} icon="bi-wallet2" color="#8b5cf6" sub={`Deductions: ${fmtCur(totalDeductions)}`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Section title="Employee Status Breakdown" icon="bi-person-badge-fill">
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <Donut size={120} stroke={22} segments={Object.entries(empByStatus).map(([k,v],i)=>({ value:v, color:STATUS_COLOR_MAP[k]||COLORS[i] }))} />
                <div style={{ flex:1 }}>
                  {Object.entries(empByStatus).map(([k,v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:STATUS_COLOR_MAP[k]||'#9ca3af', flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:13 }}>{k}</span>
                      <span style={{ fontWeight:700 }}>{fmt(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
            <Section title="Employee Type Distribution" icon="bi-diagram-3-fill">
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <Donut size={120} stroke={22} segments={Object.entries(empByType).map(([k,v],i)=>({ value:v, color:TYPE_COLOR_MAP[k]||COLORS[i] }))} />
                <div style={{ flex:1 }}>
                  {Object.entries(empByType).map(([k,v]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:TYPE_COLOR_MAP[k]||'#9ca3af', flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:12 }}>{k.replace('_',' ')}</span>
                      <span style={{ fontWeight:700 }}>{fmt(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Employee count bar chart */}
          <div style={{ marginBottom: 16 }}>
            <Section title="Employee Count by Department" icon="bi-bar-chart-fill">
              <BarChart data={empDeptBarData} height={220} multiColor />
            </Section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Section title="Employee Type Distribution" icon="bi-diagram-3">
              <BarChart data={empTypeBarData} height={200} multiColor />
            </Section>
            <Section title="Dept-wise Salary Expense" icon="bi-cash-coin">
              <BarChart data={salDeptBarData} height={200} color="#8b5cf6" formatValue={v => `₹${v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(1)+'k':v}`} />
            </Section>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FINANCE TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'finance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Fees Collected"  value={fmtCur(totalFeeCollected)} icon="bi-cash-coin"      color="#10b981" sub={`${fmt(feePaid.length)} payments`} />
            <KpiCard label="Fees Pending"    value={fmtCur(totalFeePending)}   icon="bi-hourglass-split" color="#ef4444" sub={`${fmt(feePending.length)} pending`} />
            <KpiCard label="Gross Payroll"   value={fmtCur(totalSalary)}       icon="bi-cash-stack"      color="#f59e0b" />
            <KpiCard label="Net Payroll"     value={fmtCur(netPayroll)}        icon="bi-wallet2"         color="#8b5cf6" sub={`${fmtCur(totalDeductions)} deducted`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Section title="Fee Payment Status" icon="bi-pie-chart-fill">
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { label:'Paid',     value:feePaid.length,    color:'#10b981' },
                  { label:'Pending',  value:feePending.length, color:'#ef4444' },
                  { label:'Partial',  value:feePartial.length, color:'#f59e0b' },
                ].map(row => {
                  const t = fees.length || 1;
                  return (
                    <div key={row.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                        <span style={{ fontWeight:600, color:row.color }}>{row.label}</span>
                        <span style={{ color:'#6b7280' }}>{fmt(row.value)} ({pct(row.value,t)}%)</span>
                      </div>
                      <div style={{ height:12, background:'#f3f4f6', borderRadius:99 }}>
                        <div style={{ height:12, width:`${pct(row.value,t)}%`, background:row.color, borderRadius:99, transition:'width .6s' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop:8, padding:'12px 16px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:600, color:'#166534' }}>Total Collected</span>
                  <span style={{ fontWeight:800, color:'#166534', fontSize:16 }}>{fmtCur(totalFeeCollected)}</span>
                </div>
              </div>
            </Section>

            <Section title="Payroll Breakdown" icon="bi-wallet2">
              {[
                { label:'Basic Salary',     value: employees.reduce((s,e)=>s+(e.basicSalary||0),0), color:'#6366f1' },
                { label:'HRA',              value: employees.reduce((s,e)=>s+(e.hra||0),0),         color:'#10b981' },
                { label:'DA',               value: employees.reduce((s,e)=>s+(e.da||0),0),          color:'#f59e0b' },
                { label:'TA',               value: employees.reduce((s,e)=>s+(e.ta||0),0),          color:'#06b6d4' },
                { label:'Bonus',            value: employees.reduce((s,e)=>s+(e.bonus||0),0),       color:'#ec4899' },
                { label:'Other Allowances', value: employees.reduce((s,e)=>s+(e.otherAllowances||0),0), color:'#8b5cf6' },
              ].map((row, i) => <HBar key={row.label} label={row.label} value={row.value} max={Math.max(...[employees.reduce((s,e)=>s+(e.basicSalary||0),0)], 1)} color={row.color} />)}
              <div style={{ marginTop:12, padding:'10px 14px', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:600, color:'#92400e' }}>Total Deductions</span>
                  <span style={{ fontWeight:800, color:'#92400e' }}>{fmtCur(totalDeductions)}</span>
                </div>
              </div>
            </Section>
          </div>

          <Section title="Admission Status Overview" icon="bi-person-plus-fill">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {Object.entries(admByStatus).map(([k,v],i) => (
                <div key={k} style={{ background:`${COLORS[i%COLORS.length]}10`, border:`1px solid ${COLORS[i%COLORS.length]}30`, borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:26, fontWeight:800, color:COLORS[i%COLORS.length] }}>{fmt(v)}</div>
                  <div style={{ fontSize:11, color:'#6b7280', fontWeight:600, marginTop:4 }}>{k}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{pct(v,admissions.length)}%</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ACADEMIC TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'academic' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Total Students"   value={fmt(students.length)}     icon="bi-mortarboard-fill"  color="#6366f1" />
            <KpiCard label="Total Subjects"   value={fmt(subjects.length)}     icon="bi-book-fill"          color="#10b981" />
            <KpiCard label="Total Teachers"   value={fmt(teachers.length)}     icon="bi-person-workspace"   color="#f59e0b" />
            <KpiCard label="Departments"      value={fmt(departments.length)}  icon="bi-building"            color="#8b5cf6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Section title="Students by Department" icon="bi-person-graduation">
              {studDeptRows.length === 0 ? <div className="text-muted text-center py-3">No student data</div> :
                studDeptRows.map(([dept,cnt],i) => <HBar key={dept} label={dept} value={cnt} max={maxStudDept} color={COLORS[i%COLORS.length]} />)}
            </Section>
            <Section title="Teacher Designations" icon="bi-award-fill">
              {teachDesRows.length === 0 ? <div className="text-muted text-center py-3">No teacher data</div> :
                teachDesRows.map(([des,cnt],i) => <HBar key={des} label={des} value={cnt} max={maxTeachDes} color={COLORS[(i+4)%COLORS.length]} />)}
            </Section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Section title="Subject-wise Attendance" icon="bi-bar-chart-fill">
              {attSubjectRows.length === 0 ? <div className="text-muted text-center py-3">No attendance data</div> :
                attSubjectRows.map((row,i) => (
                  <div key={row.name} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                      <span style={{ fontWeight:500, color:'#374151', maxWidth:'55%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.name}</span>
                      <span style={{ fontSize:12, color:'#6b7280' }}>{row.present}/{row.total}</span>
                      <span style={{ fontWeight:700, fontSize:12, color: parseFloat(row.pct)>=75?'#10b981':parseFloat(row.pct)>=50?'#f59e0b':'#ef4444' }}>{row.pct}%</span>
                    </div>
                    <div style={{ height:8, background:'#f3f4f6', borderRadius:99 }}>
                      <div style={{ height:8, width:`${row.pct}%`, borderRadius:99, background:parseFloat(row.pct)>=75?'#10b981':parseFloat(row.pct)>=50?'#f59e0b':'#ef4444', transition:'width .6s' }} />
                    </div>
                  </div>
                ))}
            </Section>

            <Section title="Department Overview" icon="bi-building-fill">
              {departments.length === 0 ? <div className="text-muted text-center py-3">No departments found</div> : (
                <div style={{ overflowY:'auto', maxHeight: 320 }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:'2px solid #f3f4f6' }}>
                        {['Department','Students','Teachers','Employees'].map(h => (
                          <th key={h} style={{ padding:'6px 8px', color:'#6b7280', fontWeight:600, textAlign: h==='Department'?'left':'center' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept,i) => {
                        const dId = dept.id || dept._id;
                        const dStuds = students.filter(s => (s.department?.id||s.department?._id||s.department) === dId).length;
                        const dTeach = teachers.filter(t => (t.department?.id||t.department?._id||t.department) === dId).length;
                        const dEmps  = employees.filter(e => (e.department?.id||e.department?._id||e.department) === dId).length;
                        return (
                          <tr key={dId} style={{ borderBottom:'1px solid #f9fafb', background: i%2===0?'transparent':'#fafafa' }}>
                            <td style={{ padding:'8px 8px', fontWeight:600, color:'#374151' }}>{dept.name}</td>
                            <td style={{ textAlign:'center', color:'#6366f1', fontWeight:700 }}>{dStuds}</td>
                            <td style={{ textAlign:'center', color:'#f59e0b', fontWeight:700 }}>{dTeach}</td>
                            <td style={{ textAlign:'center', color:'#10b981', fontWeight:700 }}>{dEmps}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

export default Reports;
