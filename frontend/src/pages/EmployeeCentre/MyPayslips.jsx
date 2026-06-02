import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { asList, fetchMyEmployee } from '../../services/employeeSelfService';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();
const COMPANY_NAME = 'ERP Pro';
const COMPANY_TAGLINE = 'Institutional Resource Planning Suite';
const COMPANY_ADDRESS = 'Campus Administration Office, Main Building';
const COMPANY_PHONE = '+91 00000 00000';
const COMPANY_EMAIL = 'accounts@erppro.edu.in';
const STORAGE_PREFIX = 'erp-pro-payslips';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatMoney = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }
  return currencyFormatter.format(Number(value));
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN');
};

const monthYearLabel = (month, year) => {
  const monthNumber = Number(month ?? 1);
  const yearNumber = Number(year ?? CURRENT_YEAR);
  return `${MONTHS[Math.max(monthNumber - 1, 0)] || 'January'} ${yearNumber}`;
};

const formatMonthYear = (record) => monthYearLabel(record?.month ?? record?.payMonth, record?.year ?? record?.payYear);

const sumValues = (...values) => values.reduce((total, value) => total + Number(value ?? 0), 0);

const getPayrollAmount = (record, keys, fallback = 0) => {
  const values = keys.map((key) => record?.[key]);
  const hasExplicitValue = values.some((value) => value !== undefined && value !== null);
  if (hasExplicitValue) {
    return sumValues(...values);
  }
  return Number(fallback ?? 0);
};

const sortPayrolls = (list) =>
  [...list].sort((left, right) => {
    const leftYear = Number(left?.year ?? left?.payYear ?? 0);
    const rightYear = Number(right?.year ?? right?.payYear ?? 0);
    if (leftYear !== rightYear) {
      return rightYear - leftYear;
    }

    const leftMonth = Number(left?.month ?? left?.payMonth ?? 0);
    const rightMonth = Number(right?.month ?? right?.payMonth ?? 0);
    return rightMonth - leftMonth;
  });

const sortPayrollsAscending = (list) =>
  [...list].sort((left, right) => {
    const leftYear = Number(left?.year ?? left?.payYear ?? 0);
    const rightYear = Number(right?.year ?? right?.payYear ?? 0);
    if (leftYear !== rightYear) {
      return leftYear - rightYear;
    }

    const leftMonth = Number(left?.month ?? left?.payMonth ?? 0);
    const rightMonth = Number(right?.month ?? right?.payMonth ?? 0);
    return leftMonth - rightMonth;
  });

const payrollDateValue = (record) => {
  const created = record?.createdAt || record?.paidDate || null;
  if (created) {
    const date = new Date(created);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const month = Number(record?.month ?? record?.payMonth ?? 1) - 1;
  const year = Number(record?.year ?? record?.payYear ?? CURRENT_YEAR);
  return new Date(year, Math.max(month, 0), 1);
};

const fiscalYearBounds = (referenceDate = new Date()) => {
  const year = referenceDate.getMonth() >= 3 ? referenceDate.getFullYear() : referenceDate.getFullYear() - 1;
  return {
    start: new Date(year, 3, 1),
    end: new Date(year + 1, 2, 31, 23, 59, 59, 999),
    label: `FY ${year}-${String(year + 1).slice(-2)}`,
  };
};

const getEmployeeName = (employee) =>
  `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || 'Employee';

const getDepartmentName = (employee) => employee?.department?.name || employee?.department?.code || 'N/A';

const storageKeyFor = (employeeId, suffix) => `${STORAGE_PREFIX}:${employeeId}:${suffix}`;

const readLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const buildSearchText = (record, employee) =>
  [
    formatMonthYear(record),
    record?.status,
    record?.transactionId,
    record?.month,
    record?.year,
    record?.basicSalary,
    record?.grossSalary,
    record?.netSalary,
    record?.deductions,
    record?.allowances,
    getEmployeeName(employee),
    employee?.employeeCode,
    employee?.designation,
    getDepartmentName(employee),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const calcRecord = (record) => {
  const basicSalary = Number(record?.basicSalary ?? 0);
  const allowances =
    record?.allowances !== undefined && record?.allowances !== null
      ? Number(record.allowances)
      : sumValues(record?.hra, record?.da, record?.ta, record?.bonus, record?.otherAllowances);
  const deductions =
    record?.deductions !== undefined && record?.deductions !== null
      ? Number(record.deductions)
      : sumValues(record?.pfDeduction, record?.taxDeduction, record?.esiDeduction, record?.otherDeductions);
  const gross = Number(record?.grossSalary ?? basicSalary + allowances);
  const net = Number(record?.netSalary ?? Math.max(gross - deductions, 0));

  return {
    basicSalary,
    allowances,
    deductions,
    gross,
    net,
    hra: Number(record?.hra ?? 0),
    da: Number(record?.da ?? 0),
    ta: Number(record?.ta ?? 0),
    bonus: Number(record?.bonus ?? 0),
    otherAllowances: Number(record?.otherAllowances ?? 0),
    pfDeduction: Number(record?.pfDeduction ?? 0),
    taxDeduction: Number(record?.taxDeduction ?? 0),
    esiDeduction: Number(record?.esiDeduction ?? 0),
    otherDeductions: Number(record?.otherDeductions ?? 0),
  };
};

const trendColor = {
  gross: '#2563eb',
  net: '#10b981',
  deductions: '#dc2626',
  allowance: '#7c3aed',
};

const statusTone = {
  PAID: 'success',
  UNPAID: 'warning',
  CANCELLED: 'danger',
};

const buildVerificationCode = (value) => {
  const seed = Array.from(String(value)).reduce((total, char) => total + char.charCodeAt(0), 0);
  const size = 21;
  const modules = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  const drawFinder = (offsetX, offsetY) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const border = x === 0 || x === 6 || y === 0 || y === 6;
        const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        modules[offsetY + y][offsetX + x] = border || center;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder =
        (x < 7 && y < 7) ||
        (x >= size - 7 && y < 7) ||
        (x < 7 && y >= size - 7);
      if (inFinder) continue;

      const hash = (seed + x * 17 + y * 31 + x * y * 7) % 11;
      modules[y][x] = hash % 2 === 0;
    }
  }

  const moduleSize = 6;
  const dimension = size * moduleSize;
  const squares = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!modules[y][x]) continue;
      squares.push(
        `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#111827" />`
      );
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}">
      <rect width="100%" height="100%" rx="12" fill="#ffffff" />
      <rect x="6" y="6" width="${dimension - 12}" height="${dimension - 12}" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
      ${squares.join('')}
    </svg>
  `;
};

const exportCsv = (rows, employee) => {
  const headers = [
    'Month',
    'Year',
    'Status',
    'Basic Salary',
    'HRA',
    'DA',
    'TA',
    'Bonus',
    'Other Allowances',
    'Gross Salary',
    'PF',
    'TDS',
    'ESI',
    'Other Deductions',
    'Total Deductions',
    'Net Salary',
    'Transaction ID',
    'Paid Date',
    'Generated Date',
  ];

  const csvRows = [
    headers.join(','),
    ...rows.map((record) => {
      const metrics = calcRecord(record);
      return [
        `"${formatMonthYear(record)}"`,
        Number(record?.year ?? record?.payYear ?? CURRENT_YEAR),
        `"${record?.status || 'UNPAID'}"`,
        metrics.basicSalary,
        metrics.hra,
        metrics.da,
        metrics.ta,
        metrics.bonus,
        metrics.otherAllowances,
        metrics.gross,
        metrics.pfDeduction,
        metrics.taxDeduction,
        metrics.esiDeduction,
        metrics.otherDeductions,
        metrics.deductions,
        metrics.net,
        `"${record?.transactionId || ''}"`,
        `"${record?.paidDate ? formatDate(record.paidDate) : ''}"`,
        `"${record?.createdAt ? formatDate(record.createdAt) : ''}"`,
      ].join(',');
    }),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvRows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payslips-${employee?.employeeCode || 'employee'}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportExcel = (rows, employee) => {
  const headers = [
    'Month',
    'Year',
    'Status',
    'Basic Salary',
    'HRA',
    'DA',
    'TA',
    'Bonus',
    'Other Allowances',
    'Gross Salary',
    'PF',
    'TDS',
    'ESI',
    'Other Deductions',
    'Total Deductions',
    'Net Salary',
    'Transaction ID',
    'Paid Date',
    'Generated Date',
  ];

  const tableRows = [
    `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`,
    ...rows.map((record) => {
      const metrics = calcRecord(record);
      const values = [
        formatMonthYear(record),
        Number(record?.year ?? record?.payYear ?? CURRENT_YEAR),
        record?.status || 'UNPAID',
        formatMoney(metrics.basicSalary),
        formatMoney(metrics.hra),
        formatMoney(metrics.da),
        formatMoney(metrics.ta),
        formatMoney(metrics.bonus),
        formatMoney(metrics.otherAllowances),
        formatMoney(metrics.gross),
        formatMoney(metrics.pfDeduction),
        formatMoney(metrics.taxDeduction),
        formatMoney(metrics.esiDeduction),
        formatMoney(metrics.otherDeductions),
        formatMoney(metrics.deductions),
        formatMoney(metrics.net),
        record?.transactionId || '',
        record?.paidDate ? formatDate(record.paidDate) : '',
        record?.createdAt ? formatDate(record.createdAt) : '',
      ];
      return `<tr>${values.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`;
    }),
  ].join('');

  const workbook = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body><table>${tableRows}</table></body>
    </html>
  `;

  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payslips-${employee?.employeeCode || 'employee'}-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const StatCard = ({ title, value, subtitle, tone = 'primary', icon }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100">
    <Card.Body className="p-4 d-flex align-items-center gap-3">
      <div
        className={`rounded-circle bg-${tone}-subtle text-${tone} d-flex align-items-center justify-content-center flex-shrink-0`}
        style={{ width: 50, height: 50 }}
      >
        <i className={`bi ${icon || 'bi-graph-up'}`} />
      </div>
      <div className="min-w-0">
        <div className={`text-${tone} fw-bold small text-uppercase mb-1`}>{title}</div>
        <div className="fs-4 fw-bold text-dark mb-1 text-truncate">{value}</div>
        <div className="text-muted small">{subtitle}</div>
      </div>
    </Card.Body>
  </Card>
);

const SkeletonBlock = ({ className = '', style = {} }) => (
  <div className={`placeholder-glow ${className}`} style={style}>
    <span className="placeholder col-12 rounded-3 d-block" style={{ minHeight: 18 }} />
  </div>
);

const ChartShell = ({ title, subtitle, children, emptyState }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100">
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="fw-bold mb-1">{title}</h5>
          <p className="text-muted small mb-0">{subtitle}</p>
        </div>
      </div>
      {children || emptyState}
    </Card.Body>
  </Card>
);

const MyPayslips = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [attachments, setAttachments] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    month: 'ALL',
    year: 'ALL',
    minAmount: '',
    maxAmount: '',
    sortBy: 'newest',
  });
  const [compareLeftId, setCompareLeftId] = useState('');
  const [compareRightId, setCompareRightId] = useState('');
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 992
  );
  const [seenLatestPayrollId, setSeenLatestPayrollId] = useState('');

  const attachmentKey = employee?.id ? storageKeyFor(employee.id, 'attachments') : null;
  const seenKey = employee?.id ? storageKeyFor(employee.id, 'seen-latest') : null;

  const loadPayslips = async (emp, preferredId = null) => {
    const response = await api.get('/payroll', {
      params: { employee: emp.id, size: 96 },
    });

    const list = sortPayrolls(asList(response.data));
    setPayslips(list);

    const nextSelected =
      (preferredId && list.find((item) => item.id === preferredId)) ||
      (selectedPayslip && list.find((item) => item.id === selectedPayslip.id)) ||
      list[0] ||
      null;

    setSelectedPayslip(nextSelected);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      const emp = await fetchMyEmployee(user);
      setEmployee(emp);

      if (!emp) {
        setPayslips([]);
        setSelectedPayslip(null);
        return;
      }

      if (typeof window !== 'undefined') {
        setAttachments(readLocalJson(storageKeyFor(emp.id, 'attachments'), {}));
        setSeenLatestPayrollId(localStorage.getItem(storageKeyFor(emp.id, 'seen-latest')) || '');
      }

      await loadPayslips(emp);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to load your payslips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 992);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!attachmentKey || typeof window === 'undefined') return;
    setAttachments(readLocalJson(attachmentKey, {}));
  }, [attachmentKey]);

  useEffect(() => {
    if (!seenKey || typeof window === 'undefined') return;
    setSeenLatestPayrollId(localStorage.getItem(seenKey) || '');
  }, [seenKey]);

  useEffect(() => {
    if (!selectedPayslip) return;
    if (!compareLeftId) setCompareLeftId(selectedPayslip.id);
    if (!compareRightId && payslips.length > 1) {
      const selectedIndex = payslips.findIndex((item) => item.id === selectedPayslip.id);
      const fallback = payslips[selectedIndex + 1] || payslips[selectedIndex - 1] || null;
      if (fallback) setCompareRightId(fallback.id);
    }
  }, [compareLeftId, compareRightId, payslips, selectedPayslip]);

  useEffect(() => {
    if (!selectedPayslip) return;
    if (!isDesktop) {
      setDetailsExpanded(true);
    }
  }, [selectedPayslip, isDesktop]);

  const selectedAllowances = getPayrollAmount(
    selectedPayslip,
    ['allowances'],
    sumValues(
      selectedPayslip?.hra,
      selectedPayslip?.da,
      selectedPayslip?.ta,
      selectedPayslip?.bonus,
      selectedPayslip?.otherAllowances
    )
  );

  const selectedDeductions = getPayrollAmount(
    selectedPayslip,
    ['deductions'],
    sumValues(
      selectedPayslip?.pfDeduction,
      selectedPayslip?.taxDeduction,
      selectedPayslip?.esiDeduction,
      selectedPayslip?.otherDeductions
    )
  );

  const currentPayrollKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const selectedMonthRecord = useMemo(
    () =>
      payslips.find(
        (record) =>
          Number(record?.month ?? record?.payMonth) === Number(selectedMonth) &&
          Number(record?.year ?? record?.payYear) === Number(selectedYear)
      ) || null,
    [payslips, selectedMonth, selectedYear]
  );

  const latestPayslip = useMemo(() => payslips[0] || null, [payslips]);

  useEffect(() => {
    if (!latestPayslip || !seenKey || typeof window === 'undefined') return;
    if (seenLatestPayrollId !== latestPayslip.id) {
      setInfo(`A new payslip is available for ${formatMonthYear(latestPayslip)}.`);
    }
  }, [latestPayslip, seenKey, seenLatestPayrollId]);

  const filteredPayslips = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    const filtered = payslips.filter((record) => {
      if (filters.status !== 'ALL' && (record?.status || 'UNPAID') !== filters.status) return false;
      if (filters.month !== 'ALL' && Number(record?.month ?? record?.payMonth) !== Number(filters.month)) {
        return false;
      }
      if (filters.year !== 'ALL' && Number(record?.year ?? record?.payYear) !== Number(filters.year)) {
        return false;
      }

      const metrics = calcRecord(record);
      if (filters.minAmount !== '' && metrics.net < Number(filters.minAmount)) return false;
      if (filters.maxAmount !== '' && metrics.net > Number(filters.maxAmount)) return false;

      if (keyword && !buildSearchText(record, employee).includes(keyword)) return false;
      return true;
    });

    const sorted = [...filtered].sort((left, right) => {
      const leftMetrics = calcRecord(left);
      const rightMetrics = calcRecord(right);
      const leftDate = payrollDateValue(left).getTime();
      const rightDate = payrollDateValue(right).getTime();

      switch (filters.sortBy) {
        case 'oldest':
          return leftDate - rightDate;
        case 'highest-net':
          return rightMetrics.net - leftMetrics.net;
        case 'lowest-net':
          return leftMetrics.net - rightMetrics.net;
        case 'paid-first':
          return (right?.status === 'PAID') - (left?.status === 'PAID') || rightDate - leftDate;
        case 'unpaid-first':
          return (left?.status === 'PAID') - (right?.status === 'PAID') || rightDate - leftDate;
        case 'largest-deduction':
          return rightMetrics.deductions - leftMetrics.deductions;
        case 'newest':
        default:
          return rightDate - leftDate;
      }
    });

    return sorted;
  }, [employee, filters, payslips]);

  useEffect(() => {
    if (!filteredPayslips.length) {
      setSelectedPayslip(null);
      return;
    }

    if (!selectedPayslip || !filteredPayslips.some((record) => record.id === selectedPayslip.id)) {
      setSelectedPayslip(filteredPayslips[0]);
    }
  }, [filteredPayslips, selectedPayslip]);

  useEffect(() => {
    if (!filteredPayslips.length) return;

    const validLeft = filteredPayslips.some((record) => record.id === compareLeftId);
    const validRight = filteredPayslips.some((record) => record.id === compareRightId);

    if (!validLeft) setCompareLeftId(filteredPayslips[0].id);
    if (!validRight) setCompareRightId(filteredPayslips[1]?.id || filteredPayslips[0].id);
  }, [compareLeftId, compareRightId, filteredPayslips]);

  const stats = useMemo(() => {
    const totalGross = payslips.reduce((total, record) => total + calcRecord(record).gross, 0);
    const totalNet = payslips.reduce((total, record) => total + calcRecord(record).net, 0);
    const totalDeductions = payslips.reduce((total, record) => total + calcRecord(record).deductions, 0);
    const totalAllowances = payslips.reduce((total, record) => total + calcRecord(record).allowances, 0);

    return {
      totalGross,
      totalNet,
      totalDeductions,
      totalAllowances,
      total: payslips.length,
      paid: payslips.filter((record) => record?.status === 'PAID').length,
      unpaid: payslips.filter((record) => record?.status !== 'PAID').length,
      averageNet: payslips.length ? totalNet / payslips.length : 0,
    };
  }, [payslips]);

  const currentFiscalYear = fiscalYearBounds();
  const fiscalYearRecords = useMemo(
    () =>
      payslips.filter((record) => {
        const date = payrollDateValue(record);
        return date >= currentFiscalYear.start && date <= currentFiscalYear.end;
      }),
    [currentFiscalYear.end, currentFiscalYear.start, payslips]
  );

  const fiscalSummary = useMemo(() => {
    return fiscalYearRecords.reduce(
      (acc, record) => {
        const metrics = calcRecord(record);
        acc.gross += metrics.gross;
        acc.net += metrics.net;
        acc.deductions += metrics.deductions;
        acc.pf += metrics.pfDeduction;
        acc.tds += metrics.taxDeduction;
        acc.esi += metrics.esiDeduction;
        return acc;
      },
      { gross: 0, net: 0, deductions: 0, pf: 0, tds: 0, esi: 0 }
    );
  }, [fiscalYearRecords]);

  const trendRecords = useMemo(() => sortPayrollsAscending(filteredPayslips), [filteredPayslips]);

  const trendData = useMemo(() => {
    return trendRecords.map((record) => {
      const metrics = calcRecord(record);
      return {
        id: record.id,
        label: formatMonthYear(record),
        date: payrollDateValue(record),
        gross: metrics.gross,
        net: metrics.net,
        deductions: metrics.deductions,
        allowances: metrics.allowances,
      };
    });
  }, [trendRecords]);

  const metricTrends = useMemo(() => {
    const groups = [
      { key: 'hra', label: 'HRA', color: '#7c3aed' },
      { key: 'da', label: 'DA', color: '#2563eb' },
      { key: 'ta', label: 'TA', color: '#0ea5e9' },
      { key: 'pfDeduction', label: 'PF', color: '#dc2626' },
      { key: 'taxDeduction', label: 'TDS', color: '#f59e0b' },
      { key: 'esiDeduction', label: 'ESI', color: '#10b981' },
    ];

    return groups.map((group) => {
      const total = payslips.reduce((sum, record) => sum + calcRecord(record)[group.key], 0);
      const average = payslips.length ? total / payslips.length : 0;
      return { ...group, total, average };
    });
  }, [payslips]);

  const compareLeft = useMemo(
    () => filteredPayslips.find((record) => record.id === compareLeftId) || selectedPayslip || null,
    [compareLeftId, filteredPayslips, selectedPayslip]
  );
  const compareRight = useMemo(
    () => filteredPayslips.find((record) => record.id === compareRightId) || filteredPayslips[1] || null,
    [compareRightId, filteredPayslips]
  );

  const comparison = useMemo(() => {
    if (!compareLeft || !compareRight) return null;

    const leftMetrics = calcRecord(compareLeft);
    const rightMetrics = calcRecord(compareRight);

    return {
      gross: leftMetrics.gross - rightMetrics.gross,
      deductions: leftMetrics.deductions - rightMetrics.deductions,
      net: leftMetrics.net - rightMetrics.net,
      allowances: leftMetrics.allowances - rightMetrics.allowances,
    };
  }, [compareLeft, compareRight]);

  const pendingPayroll = !selectedMonthRecord && selectedMonth && selectedYear;

  const markCurrentAsSeen = () => {
    if (!latestPayslip || !seenKey || typeof window === 'undefined') return;
    localStorage.setItem(seenKey, latestPayslip.id);
    setSeenLatestPayrollId(latestPayslip.id);
  };

  const handleGeneratePayslip = async () => {
    if (!employee?.id) {
      setError('Employee profile not found. Please contact HR.');
      return;
    }

    if (!employee?.basicSalary || Number(employee.basicSalary) <= 0) {
      setError('Your basic salary is not configured yet. Please contact HR.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setInfo(null);

      const response = await api.post('/payroll/generate', {
        employee: employee.id,
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });

      const result = response.data;
      const payroll = result?.payroll || result;
      const created = Boolean(result?.created);

      setInfo(
        created
          ? `Payslip generated for ${MONTHS[selectedMonth - 1]} ${selectedYear}.`
          : `Payslip already existed for ${MONTHS[selectedMonth - 1]} ${selectedYear}; it has been loaded instead.`
      );

      await loadPayslips(employee, payroll?.id);
    } catch (generateError) {
      setError(generateError?.response?.data?.message || 'Unable to generate the selected payslip.');
    } finally {
      setGenerating(false);
    }
  };

  const buildPayslipPrintMarkup = (payslip) => {
    if (!employee || !payslip) return '';

    const metrics = calcRecord(payslip);
    const employeeName = getEmployeeName(employee);
    const departmentName = getDepartmentName(employee);
    const paidDate = payslip.paidDate ? formatDate(payslip.paidDate) : '—';
    const transactionId = payslip.transactionId || '—';
    const verificationId = `${payslip.year || CURRENT_YEAR}-${String(payslip.month || CURRENT_MONTH).padStart(2, '0')}-${String(
      payslip.id || '0000'
    ).slice(-8)}`;
    const qrMarkup = buildVerificationCode(verificationId);

    const attachmentList = (attachments?.[payslip.id] || [])
      .map(
        (file) => `
          <li style="margin-bottom:6px;">${escapeHtml(file.name)} <span style="color:#64748b;">(${escapeHtml(
          Math.round((file.size || 0) / 1024)
        )} KB)</span></li>
        `
      )
      .join('');

    return `
      <html>
        <head>
          <title>Payslip ${escapeHtml(formatMonthYear(payslip))}</title>
          <style>
            @page { size: A4; margin: 14mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              background: #f3f4f6;
              color: #0f172a;
            }
            .sheet {
              background: #fff;
              padding: 24px;
              border-radius: 20px;
              border: 1px solid #e5e7eb;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 24px;
              border-bottom: 2px solid #dbeafe;
              padding-bottom: 18px;
              margin-bottom: 20px;
            }
            .brand {
              display: flex;
              gap: 14px;
              align-items: center;
            }
            .logo {
              width: 62px;
              height: 62px;
              border-radius: 16px;
              background: linear-gradient(135deg, #2563eb 0%, #0f172a 100%);
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              font-weight: 900;
            }
            .company {
              line-height: 1.4;
            }
            .company h1 {
              margin: 0;
              font-size: 22px;
              color: #111827;
            }
            .company p {
              margin: 2px 0;
              color: #475569;
              font-size: 12px;
            }
            .meta {
              text-align: right;
            }
            .meta h2 {
              margin: 0;
              font-size: 24px;
              color: #111827;
            }
            .meta .sub {
              margin-top: 6px;
              font-size: 12px;
              color: #64748b;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 18px;
            }
            .info-card {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 14px;
              background: #f8fafc;
            }
            .info-card .label {
              color: #64748b;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: .05em;
              margin-bottom: 4px;
            }
            .info-card .value {
              font-size: 15px;
              font-weight: 700;
              color: #111827;
            }
            .section {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 18px;
              margin-bottom: 14px;
            }
            .section h3 {
              margin: 0 0 14px;
              font-size: 16px;
              font-weight: 800;
            }
            .earnings { background: #f8fafc; }
            .deductions { background: #fff5f5; }
            .rows {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            .rows td {
              padding: 10px 0;
              border-bottom: 1px solid #edf2f7;
            }
            .rows td:last-child {
              text-align: right;
              font-weight: 700;
            }
            .net-box {
              padding: 18px;
              border-radius: 16px;
              background: linear-gradient(135deg,#10b981,#059669);
              color: #fff;
              text-align: center;
              margin-top: 6px;
            }
            .stamp-area {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              gap: 24px;
              margin-top: 20px;
              padding-top: 18px;
              border-top: 1px solid #e5e7eb;
            }
            .signature-block {
              min-width: 260px;
              text-align: center;
            }
            .signature-line {
              margin-top: 40px;
              border-top: 1px solid #94a3b8;
              padding-top: 8px;
              font-size: 12px;
              color: #475569;
            }
            .footer-note {
              margin-top: 16px;
              text-align: center;
              font-size: 11px;
              color: #64748b;
            }
            .foot-grid {
              display: grid;
              grid-template-columns: 1.1fr 0.9fr;
              gap: 14px;
              margin-top: 14px;
            }
            .qr-box {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 12px;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              background: #fff;
            }
            .attachments {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 14px;
              background: #f8fafc;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div class="brand">
                <div class="logo">EP</div>
                <div class="company">
                  <h1>${escapeHtml(COMPANY_NAME)}</h1>
                  <p>${escapeHtml(COMPANY_TAGLINE)}</p>
                  <p>${escapeHtml(COMPANY_ADDRESS)}</p>
                  <p>${escapeHtml(COMPANY_PHONE)} · ${escapeHtml(COMPANY_EMAIL)}</p>
                </div>
              </div>
              <div class="meta">
                <h2>Payslip</h2>
                <div class="sub">${escapeHtml(formatMonthYear(payslip))}</div>
                <div class="sub">Payslip No: ${escapeHtml(payslip.id || '—')}</div>
                <div class="sub">Status: ${escapeHtml(payslip.status || 'UNPAID')}</div>
                <div class="sub">Verification ID: ${escapeHtml(verificationId)}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <div class="label">Employee Name</div>
                <div class="value">${escapeHtml(employeeName)}</div>
              </div>
              <div class="info-card">
                <div class="label">Employee Code</div>
                <div class="value">${escapeHtml(employee.employeeCode || '—')}</div>
              </div>
              <div class="info-card">
                <div class="label">Designation</div>
                <div class="value">${escapeHtml(employee.designation || '—')}</div>
              </div>
              <div class="info-card">
                <div class="label">Department</div>
                <div class="value">${escapeHtml(departmentName)}</div>
              </div>
              <div class="info-card">
                <div class="label">Paid Date</div>
                <div class="value">${escapeHtml(paidDate)}</div>
              </div>
              <div class="info-card">
                <div class="label">Transaction ID</div>
                <div class="value">${escapeHtml(transactionId)}</div>
              </div>
              <div class="info-card">
                <div class="label">Net Pay</div>
                <div class="value">${escapeHtml(formatMoney(metrics.net))}</div>
              </div>
              <div class="info-card">
                <div class="label">Base Salary</div>
                <div class="value">${escapeHtml(formatMoney(metrics.basicSalary))}</div>
              </div>
            </div>

            <div class="section earnings">
              <h3 style="color:#059669;">Earnings</h3>
              <table class="rows">
                <tbody>
                  <tr><td>Basic Salary</td><td>${escapeHtml(formatMoney(metrics.basicSalary))}</td></tr>
                  <tr><td>HRA</td><td>${escapeHtml(formatMoney(metrics.hra))}</td></tr>
                  <tr><td>DA</td><td>${escapeHtml(formatMoney(metrics.da))}</td></tr>
                  <tr><td>TA</td><td>${escapeHtml(formatMoney(metrics.ta))}</td></tr>
                  <tr><td>Bonus</td><td>${escapeHtml(formatMoney(metrics.bonus))}</td></tr>
                  <tr><td>Other Allowances</td><td>${escapeHtml(formatMoney(metrics.otherAllowances))}</td></tr>
                  <tr><td>Gross Salary</td><td style="color:#059669;">${escapeHtml(formatMoney(metrics.gross))}</td></tr>
                </tbody>
              </table>
            </div>

            <div class="section deductions">
              <h3 style="color:#dc2626;">Deductions</h3>
              <table class="rows">
                <tbody>
                  <tr><td>PF (Provident Fund)</td><td>${escapeHtml(formatMoney(metrics.pfDeduction))}</td></tr>
                  <tr><td>Tax (TDS)</td><td>${escapeHtml(formatMoney(metrics.taxDeduction))}</td></tr>
                  <tr><td>ESI</td><td>${escapeHtml(formatMoney(metrics.esiDeduction))}</td></tr>
                  <tr><td>Other Deductions</td><td>${escapeHtml(formatMoney(metrics.otherDeductions))}</td></tr>
                  <tr><td>Total Deductions</td><td style="color:#dc2626;">${escapeHtml(formatMoney(metrics.deductions))}</td></tr>
                </tbody>
              </table>
            </div>

            <div class="net-box">
              <div style="font-size:12px;opacity:.8;margin-bottom:6px;">Net Take-Home Pay</div>
              <div style="font-size:30px;font-weight:900;">${escapeHtml(formatMoney(metrics.net))}</div>
              <div style="font-size:12px;opacity:.9;margin-top:4px;">
                ${escapeHtml(
                  payslip.status === 'PAID'
                    ? 'Paid and acknowledged'
                    : 'Prepared for review or payment'
                )}
              </div>
            </div>

            <div class="foot-grid">
              <div class="attachments">
                <div style="font-size:12px;color:#64748b;margin-bottom:6px;font-weight:700;">Remarks</div>
                <div style="font-size:13px;color:#111827;">
                  This payslip is system generated and valid without physical signature when printed from ERP Pro.
                </div>
                ${attachmentList ? `<div style="margin-top:12px;"><strong>Attachments:</strong><ul style="margin:8px 0 0 18px;padding:0;">${attachmentList}</ul></div>` : ''}
              </div>
              <div class="qr-box">
                ${qrMarkup}
              </div>
            </div>

            <div class="stamp-area">
              <div></div>
              <div class="signature-block">
                <div style="display:inline-block;border:4px solid #2563eb;border-radius:50%;padding:18px 22px;color:#2563eb;font-weight:800;transform:rotate(-12deg);">
                  ${escapeHtml(COMPANY_NAME)}<br/>Official<br/>Stamp
                </div>
                <div class="signature-line">Authorized Signatory</div>
              </div>
            </div>

            <div class="footer-note">
              This document is a computer-generated payslip and does not require a manual signature.
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const openPayslipPdf = () => {
    if (!selectedPayslip) {
      setError('Please select a payslip first.');
      return;
    }

    const html = buildPayslipPrintMarkup(selectedPayslip);
    if (!html) {
      setError('Unable to build the payslip preview.');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow;
      if (!frameWindow) {
        document.body.removeChild(iframe);
        setError('Unable to open the print preview.');
        return;
      }

      const cleanup = () => {
        window.removeEventListener('afterprint', cleanup);
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 300);
      };

      window.addEventListener('afterprint', cleanup, { once: true });
      frameWindow.focus();
      setTimeout(() => frameWindow.print(), 250);
    };

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  };

  const openEmailDraft = () => {
    if (!selectedPayslip) {
      setError('Please select a payslip first.');
      return;
    }

    const subject = `Payslip ${formatMonthYear(selectedPayslip)} - ${getEmployeeName(employee)}`;
    const body = [
      `Hello ${getEmployeeName(employee)},`,
      '',
      `Your payslip for ${formatMonthYear(selectedPayslip)} is ready.`,
      `Net Salary: ${formatMoney(calcRecord(selectedPayslip).net)}`,
      `Gross Salary: ${formatMoney(calcRecord(selectedPayslip).gross)}`,
      `Deductions: ${formatMoney(calcRecord(selectedPayslip).deductions)}`,
      `Transaction ID: ${selectedPayslip.transactionId || 'N/A'}`,
      '',
      'You can review the slip in the ERP portal.',
    ].join('\n');

    const mailto = `mailto:${employee?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
    window.location.href = mailto;
  };

  const handleAttachmentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!selectedPayslip || !attachmentKey) {
      setError('Select a payslip before attaching files.');
      return;
    }

    if (!files.length) return;

    try {
      const uploaded = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  uploadedAt: new Date().toISOString(),
                  dataUrl: String(reader.result || ''),
                });
              reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
              reader.readAsDataURL(file);
            })
        )
      );

      const next = {
        ...(attachments || {}),
        [selectedPayslip.id]: [...(attachments?.[selectedPayslip.id] || []), ...uploaded],
      };

      setAttachments(next);
      writeLocalJson(attachmentKey, next);
      setInfo(`${uploaded.length} attachment${uploaded.length > 1 ? 's' : ''} saved for this payslip.`);
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to store the attachment.');
    }
  };

  const removeAttachment = (attachmentIndex) => {
    if (!selectedPayslip || !attachmentKey) return;

    const current = attachments?.[selectedPayslip.id] || [];
    const nextFiles = current.filter((_, index) => index !== attachmentIndex);
    const next = { ...(attachments || {}), [selectedPayslip.id]: nextFiles };
    setAttachments(next);
    writeLocalJson(attachmentKey, next);
  };

  const downloadAttachment = (file) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTrendChart = () => {
    if (!trendData.length) {
      return (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-graph-up fs-1 d-block mb-2" />
          No salary history yet.
        </div>
      );
    }

    const width = 720;
    const height = 280;
    const padding = { top: 24, right: 24, bottom: 52, left: 48 };
    const values = trendData.flatMap((item) => [item.gross, item.net]);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const span = Math.max(max - min, 1);
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const xStep = trendData.length > 1 ? innerWidth / (trendData.length - 1) : 0;

    const toPoint = (value, index) => {
      const x = padding.left + xStep * index;
      const y = padding.top + innerHeight - ((value - min) / span) * innerHeight;
      return { x, y };
    };

    const pathFor = (key) =>
      trendData
        .map((item, index) => {
          const { x, y } = toPoint(item[key], index);
          return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');

    const grossPath = pathFor('gross');
    const netPath = pathFor('net');

    return (
      <div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
          <defs>
            <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor.gross} stopOpacity="0.28" />
              <stop offset="100%" stopColor={trendColor.gross} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor.net} stopOpacity="0.28" />
              <stop offset="100%" stopColor={trendColor.net} stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: 4 }).map((_, index) => {
            const y = padding.top + (innerHeight * index) / 3;
            const value = Math.round(max - ((max - min) * index) / 3);
            return (
              <g key={index} opacity="0.12">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#475569">
                  {formatMoney(value)}
                </text>
              </g>
            );
          })}

          <path
            d={`${grossPath} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${
              height - padding.bottom
            } Z`}
            fill="url(#grossFill)"
            opacity="0.7"
          />
          <path
            d={`${netPath} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${
              height - padding.bottom
            } Z`}
            fill="url(#netFill)"
            opacity="0.7"
          />
          <path d={grossPath} fill="none" stroke={trendColor.gross} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={netPath} fill="none" stroke={trendColor.net} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {trendData.map((item, index) => {
            const grossPoint = toPoint(item.gross, index);
            const netPoint = toPoint(item.net, index);
            return (
              <g key={item.id}>
                <circle cx={grossPoint.x} cy={grossPoint.y} r="4.5" fill="#fff" stroke={trendColor.gross} strokeWidth="2" />
                <circle cx={netPoint.x} cy={netPoint.y} r="4.5" fill="#fff" stroke={trendColor.net} strokeWidth="2" />
                <text x={grossPoint.x} y={height - 16} textAnchor="middle" fontSize="9" fill="#64748b">
                  {item.label.replace(' ', '\n')}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="d-flex flex-wrap gap-3 mt-3">
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle d-inline-block" style={{ width: 12, height: 12, background: trendColor.gross }} />
            <span className="small text-muted">Gross salary</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="rounded-circle d-inline-block" style={{ width: 12, height: 12, background: trendColor.net }} />
            <span className="small text-muted">Net salary</span>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonCard = () => {
    if (!compareLeft || !compareRight || !comparison) {
      return (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-arrow-left-right fs-1 d-block mb-2" />
          Select two payslips to compare.
        </div>
      );
    }

    const leftMetrics = calcRecord(compareLeft);
    const rightMetrics = calcRecord(compareRight);

    const metricRow = (label, leftValue, rightValue, delta, deltaTone = 'primary') => (
      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div>
          <div className="fw-semibold text-dark">{label}</div>
          <div className="small text-muted">
            {formatMonthYear(compareLeft)} vs {formatMonthYear(compareRight)}
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold text-dark">
            {formatMoney(leftValue)} <span className="text-muted fw-normal">/</span> {formatMoney(rightValue)}
          </div>
          <Badge bg={delta >= 0 ? deltaTone : 'secondary'} className="rounded-pill px-3">
            {delta >= 0 ? '+' : ''}
            {formatMoney(delta)}
          </Badge>
        </div>
      </div>
    );

    return (
      <Card className="border-0 shadow-sm rounded-4 h-100">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">Compare two months</h5>
              <p className="text-muted small mb-0">See how gross pay, deductions, and net salary changed.</p>
            </div>
            <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
              {formatMonthYear(compareLeft)} vs {formatMonthYear(compareRight)}
            </Badge>
          </div>

          {metricRow('Gross salary', leftMetrics.gross, rightMetrics.gross, comparison.gross, 'primary')}
          {metricRow('Deductions', leftMetrics.deductions, rightMetrics.deductions, comparison.deductions, 'danger')}
          {metricRow('Net salary', leftMetrics.net, rightMetrics.net, comparison.net, 'success')}
          {metricRow('Allowances', leftMetrics.allowances, rightMetrics.allowances, comparison.allowances, 'info')}
        </Card.Body>
      </Card>
    );
  };

  const renderPayrollDetails = () => {
    if (!selectedPayslip) {
      return (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-file-earmark-text fs-1 d-block mb-3" />
          <h5 className="fw-bold text-dark">No payslip selected</h5>
          <p className="mb-0">Select a row from the table to inspect the detailed salary breakdown.</p>
        </div>
      );
    }

    const metrics = calcRecord(selectedPayslip);
    const attachmentList = attachments?.[selectedPayslip.id] || [];
    const timelineEntries = [
      {
        label: 'Payslip generated',
        value: selectedPayslip.createdAt,
        icon: 'bi-stars',
        tone: 'primary',
      },
      {
        label: 'Payment processed',
        value: selectedPayslip.paidDate,
        icon: 'bi-credit-card-2-front',
        tone: 'success',
      },
      {
        label: 'Transaction ID',
        value: selectedPayslip.transactionId || '-',
        icon: 'bi-hash',
        tone: 'info',
        plain: true,
      },
    ];

    return (
      <>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="text-muted small text-uppercase fw-semibold mb-1">Payslip Preview</div>
            <h5 className="fw-bold mb-1">{formatMonthYear(selectedPayslip)}</h5>
            <div className="text-muted small">
              {employee?.firstName} {employee?.lastName}
              {employee?.employeeCode ? ` | ${employee.employeeCode}` : ''}
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <Button size="sm" variant="outline-secondary" className="rounded-pill" onClick={openPayslipPdf}>
              <i className="bi bi-download me-1" />
              Download PDF
            </Button>
            <Button size="sm" variant="outline-success" className="rounded-pill" onClick={() => exportCsv([selectedPayslip], employee)}>
              <i className="bi bi-filetype-csv me-1" />
              CSV
            </Button>
            <Button size="sm" variant="outline-success" className="rounded-pill" onClick={() => exportExcel([selectedPayslip], employee)}>
              <i className="bi bi-file-earmark-excel me-1" />
              Excel
            </Button>
            <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={openEmailDraft}>
              <i className="bi bi-envelope me-1" />
              Email
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-4 mb-3" style={{ background: '#f8fafc' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-success mb-0">Earnings</h6>
            <Badge bg="success" className="rounded-pill px-3">
              {formatMoney(metrics.gross)}
            </Badge>
          </div>

          {[
            ['Basic Salary', metrics.basicSalary],
            ['HRA (House Rent Allowance)', metrics.hra],
            ['DA (Dearness Allowance)', metrics.da],
            ['TA (Travel Allowance)', metrics.ta],
            ['Other Allowances', metrics.otherAllowances],
            ['Bonus', metrics.bonus],
            ['Gross Total', metrics.gross, true],
          ].map(([label, value, emphasis]) => (
            <div
              key={label}
              className="d-flex justify-content-between py-2 border-bottom"
            >
              <span className={`small ${emphasis ? 'fw-semibold text-dark' : 'text-muted'}`}>{label}</span>
              <span className={`small ${emphasis ? 'fw-bold text-dark' : 'fw-semibold'}`}>{formatMoney(value)}</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-4 mb-3" style={{ background: '#fff5f5' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-danger mb-0">Deductions</h6>
            <Badge bg="danger" className="rounded-pill px-3">
              {formatMoney(selectedDeductions)}
            </Badge>
          </div>

          {[
            ['PF (Provident Fund)', metrics.pfDeduction],
            ['Tax (TDS)', metrics.taxDeduction],
            ['ESI', metrics.esiDeduction],
            ['Other Deductions', metrics.otherDeductions],
          ].map(([label, value]) => (
            <div key={label} className="d-flex justify-content-between py-2 border-bottom">
              <span className="small text-muted">{label}</span>
              <span className="small fw-semibold text-danger">{formatMoney(value)}</span>
            </div>
          ))}
        </div>

        <div
          className="p-4 rounded-4 text-center text-white mb-3"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <div className="small opacity-75 mb-1">Net Take-Home Pay</div>
          <div className="fw-bold display-6 mb-2">{formatMoney(metrics.net)}</div>
          <div className="small opacity-75">
            {selectedPayslip?.status === 'PAID'
              ? `Paid on ${selectedPayslip.paidDate ? formatDate(selectedPayslip.paidDate) : 'the payment date'}`
              : 'Ready to be processed or printed.'}
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col md={6}>
            <div className="border rounded-4 p-3 h-100">
              <div className="text-muted small mb-1">Payroll Status</div>
              <Badge
                bg={statusTone[selectedPayslip?.status] || 'warning'}
                className="rounded-pill px-3 py-2"
              >
                {selectedPayslip?.status || 'UNPAID'}
              </Badge>
            </div>
          </Col>
          <Col md={6}>
            <div className="border rounded-4 p-3 h-100">
              <div className="text-muted small mb-1">Transaction ID</div>
              <div className="fw-semibold text-dark">{selectedPayslip?.transactionId || '-'}</div>
            </div>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm rounded-4 mb-3">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1">Payment timeline</h6>
                <p className="text-muted small mb-0">Generated and paid milestones for this payslip.</p>
              </div>
              <Badge bg="light" text="dark" className="rounded-pill px-3">
                {formatMonthYear(selectedPayslip)}
              </Badge>
            </div>

            <div className="d-grid gap-3">
              {timelineEntries.map((entry, index) => (
                <div key={entry.label} className="d-flex gap-3 align-items-start">
                  <div
                    className={`rounded-circle bg-${entry.tone}-subtle text-${entry.tone} d-flex align-items-center justify-content-center flex-shrink-0`}
                    style={{ width: 38, height: 38 }}
                  >
                    <i className={`bi ${entry.icon}`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between gap-2">
                      <div className="fw-semibold text-dark">{entry.label}</div>
                      <Badge bg="light" text="dark" className="rounded-pill">
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="text-muted small">
                      {entry.plain ? entry.value : formatDate(entry.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm rounded-4 mb-3">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1">Attachments</h6>
                <p className="text-muted small mb-0">Store tax proofs, reimbursement docs, or notes locally in your browser.</p>
              </div>
              <Form.Label className="btn btn-outline-primary rounded-pill mb-0">
                <i className="bi bi-paperclip me-1" />
                Add files
                <Form.Control type="file" multiple hidden onChange={handleAttachmentUpload} />
              </Form.Label>
            </div>

            {attachmentList.length > 0 ? (
              <div className="d-grid gap-2">
                {attachmentList.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="border rounded-4 p-3 d-flex justify-content-between align-items-center"
                  >
                    <div className="me-3">
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 230 }}>
                        {file.name}
                      </div>
                      <div className="text-muted small">
                        {Math.round((file.size || 0) / 1024)} KB · {formatDate(file.uploadedAt)}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => downloadAttachment(file)}>
                        Download
                      </Button>
                      <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => removeAttachment(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted small border rounded-4 p-4 text-center">
                No local attachments saved for this payslip yet.
              </div>
            )}
          </Card.Body>
        </Card>
      </>
    );
  };

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Payslips</h2>
            <p className="text-muted mb-0 small">
              Generate monthly salary slips, review earnings and deductions, compare months, and export or print anytime.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {latestPayslip && seenLatestPayrollId !== latestPayslip.id && (
              <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2">
                <i className="bi bi-bell-fill" />
                New payslip
              </Badge>
            )}
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={fetchData} disabled={loading || generating}>
              <i className="bi bi-arrow-clockwise me-2" />
              Refresh
            </Button>
            <Button variant="outline-success" className="rounded-pill px-4" onClick={() => exportCsv(filteredPayslips, employee)} disabled={!filteredPayslips.length}>
              <i className="bi bi-filetype-csv me-2" />
              CSV
            </Button>
            <Button variant="outline-success" className="rounded-pill px-4" onClick={() => exportExcel(filteredPayslips, employee)} disabled={!filteredPayslips.length}>
              <i className="bi bi-file-earmark-excel me-2" />
              Excel
            </Button>
            <Button variant="primary" className="rounded-pill px-4" onClick={handleGeneratePayslip} disabled={generating || !employee?.basicSalary}>
              {generating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Generating
                </>
              ) : (
                <>
                  <i className="bi bi-receipt me-2" />
                  Generate Payslip
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm rounded-4">
          {error}
        </Alert>
      )}

      {info && (
        <Alert variant="success" className="border-0 shadow-sm rounded-4 d-flex justify-content-between align-items-center gap-3">
          <div>{info}</div>
          {latestPayslip && seenLatestPayrollId !== latestPayslip.id && (
            <Button variant="outline-success" size="sm" className="rounded-pill" onClick={markCurrentAsSeen}>
              Mark as seen
            </Button>
          )}
        </Alert>
      )}

      {pendingPayroll && (
        <Alert variant="warning" className="border-0 shadow-sm rounded-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="fw-bold mb-1">Payroll not generated for {monthYearLabel(selectedMonth, selectedYear)}</div>
              <div className="small">
                You can generate it now, then it will appear in the payslip list once the server creates the record.
              </div>
            </div>
            <Button variant="dark" className="rounded-pill px-4" onClick={handleGeneratePayslip} disabled={generating || !employee?.basicSalary}>
              Generate now
            </Button>
          </div>
        </Alert>
      )}

      {loading ? (
        <>
          <Row className="g-3 mb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Col md={3} key={index}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <SkeletonBlock style={{ width: '45%', height: 14, marginBottom: 12 }} />
                    <SkeletonBlock style={{ width: '70%', height: 34, marginBottom: 12 }} />
                    <SkeletonBlock style={{ width: '85%', height: 12 }} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <Row className="g-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Col md={3} key={index}>
                    <SkeletonBlock style={{ width: '100%', height: 42 }} />
                  </Col>
                ))}
                <Col md={12}>
                  <SkeletonBlock style={{ width: '100%', height: 42 }} />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="placeholder-glow">
                    <span className="placeholder col-6 rounded-3 d-block mb-3" style={{ height: 18 }} />
                    <span className="placeholder col-12 rounded-3 d-block" style={{ height: 340 }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <SkeletonBlock style={{ width: '65%', height: 18, marginBottom: 16 }} />
                  {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonBlock key={index} style={{ width: '100%', height: 24, marginBottom: 10 }} />
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <Card.Body
              className="p-4 p-lg-5"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}
            >
              <Row className="align-items-center g-4">
                <Col lg={8}>
                  <div className="text-uppercase small fw-semibold mb-2 opacity-75">Employee Self Service</div>
                  <h3 className="fw-bold mb-2">Payslip generation hub</h3>
                  <p className="mb-0 text-white-50">
                    Search, filter, compare, and export your salary history. Use the generator to create a missing month, then
                    open a detailed print-ready slip instantly.
                  </p>
                </Col>
                <Col lg={4}>
                  <div className="bg-white bg-opacity-10 rounded-4 p-4">
                    <div className="small text-white-50">Current base salary</div>
                    <div className="display-6 fw-bold mb-1">{formatMoney(employee?.basicSalary)}</div>
                    <div className="small text-white-50">
                      {employee?.designation || 'Employee'}
                      {employee?.employeeCode ? ` | ${employee.employeeCode}` : ''}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-4">
            <Col md={3}>
              <StatCard title="Generated Slips" value={stats.total} subtitle={`Gross total: ${formatMoney(stats.totalGross)}`} tone="primary" icon="bi-receipt" />
            </Col>
            <Col md={3}>
              <StatCard title="Paid" value={stats.paid} subtitle={`Pending slips: ${stats.unpaid}`} tone="success" icon="bi-check2-circle" />
            </Col>
            <Col md={3}>
              <StatCard title="Pending" value={stats.unpaid} subtitle={`Total deductions: ${formatMoney(stats.totalDeductions)}`} tone="warning" icon="bi-hourglass-split" />
            </Col>
            <Col md={3}>
              <StatCard title="Net Salary" value={formatMoney(selectedPayslip?.netSalary ?? stats.averageNet)} subtitle="Selected slip or average net pay" tone="info" icon="bi-wallet2" />
            </Col>
          </Row>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Label className="fw-semibold">Search</Form.Label>
                  <Form.Control
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    placeholder="Search month, status, amount..."
                  />
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-semibold">Month</Form.Label>
                  <Form.Select
                    value={filters.month}
                    onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
                  >
                    <option value="ALL">All Months</option>
                    {MONTHS.map((monthName, index) => (
                      <option key={monthName} value={index + 1}>
                        {monthName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-semibold">Year</Form.Label>
                  <Form.Control
                    type="number"
                    min="2000"
                    max="2100"
                    value={filters.year === 'ALL' ? '' : filters.year}
                    onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value ? Number(event.target.value) : 'ALL' }))}
                    placeholder="All Years"
                  />
                </Col>
                <Col md={2}>
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PAID">PAID</option>
                    <option value="UNPAID">UNPAID</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Form.Select>
                </Col>
                <Col md={1}>
                  <Form.Label className="fw-semibold">Min</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={filters.minAmount}
                    onChange={(event) => setFilters((prev) => ({ ...prev, minAmount: event.target.value }))}
                    placeholder="0"
                  />
                </Col>
                <Col md={1}>
                  <Form.Label className="fw-semibold">Max</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={filters.maxAmount}
                    onChange={(event) => setFilters((prev) => ({ ...prev, maxAmount: event.target.value }))}
                    placeholder="0"
                  />
                </Col>
                <Col md={1}>
                  <Form.Label className="fw-semibold">Sort</Form.Label>
                  <Form.Select
                    value={filters.sortBy}
                    onChange={(event) => setFilters((prev) => ({ ...prev, sortBy: event.target.value }))}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest-net">Highest Net</option>
                    <option value="lowest-net">Lowest Net</option>
                    <option value="paid-first">Paid First</option>
                    <option value="unpaid-first">Unpaid First</option>
                    <option value="largest-deduction">Largest Deduction</option>
                  </Form.Select>
                </Col>
                <Col md={12} className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                  <div className="text-muted small">
                    Showing {filteredPayslips.length} of {payslips.length} records.
                  </div>
                  <Button
                    variant="link"
                    className="text-danger text-decoration-none px-0"
                    onClick={() =>
                      setFilters({
                        search: '',
                        status: 'ALL',
                        month: 'ALL',
                        year: 'ALL',
                        minAmount: '',
                        maxAmount: '',
                        sortBy: 'newest',
                      })
                    }
                  >
                    Clear all filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4 mb-4">
            <Col lg={7}>
              <ChartShell
                title="Salary history chart"
                subtitle="Month-over-month gross and net salary comparison."
                emptyState={
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-graph-up fs-1 d-block mb-2" />
                    No chart data available.
                  </div>
                }
              >
                {renderTrendChart()}
              </ChartShell>
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Tax summary</h5>
                      <p className="text-muted small mb-0">{currentFiscalYear.label}</p>
                    </div>
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                      FY overview
                    </Badge>
                  </div>

                  <div className="d-grid gap-3">
                    <div className="border rounded-4 p-3">
                      <div className="text-muted small mb-1">Gross income</div>
                      <div className="fw-bold fs-5">{formatMoney(fiscalSummary.gross)}</div>
                    </div>
                    <div className="border rounded-4 p-3">
                      <div className="text-muted small mb-1">Total deductions</div>
                      <div className="fw-bold fs-5 text-danger">{formatMoney(fiscalSummary.deductions)}</div>
                    </div>
                    <Row className="g-3">
                      <Col md={4}>
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small mb-1">PF</div>
                          <div className="fw-bold">{formatMoney(fiscalSummary.pf)}</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small mb-1">TDS</div>
                          <div className="fw-bold">{formatMoney(fiscalSummary.tds)}</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="border rounded-4 p-3 h-100">
                          <div className="text-muted small mb-1">ESI</div>
                          <div className="fw-bold">{formatMoney(fiscalSummary.esi)}</div>
                        </div>
                      </Col>
                    </Row>
                    <div className="border rounded-4 p-3">
                      <div className="text-muted small mb-1">Net take-home</div>
                      <div className="fw-bold fs-5 text-success">{formatMoney(fiscalSummary.net)}</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            {metricTrends.map((item) => (
              <Col md={4} lg={2} key={item.label}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div
                        className="rounded-circle"
                        style={{ width: 12, height: 12, background: item.color }}
                      />
                      <Badge bg="light" text="dark" className="rounded-pill">
                        Trend
                      </Badge>
                    </div>
                    <div className="fw-bold text-dark mb-1">{item.label}</div>
                    <div className="text-muted small mb-2">Total: {formatMoney(item.total)}</div>
                    <div className="small fw-semibold" style={{ color: item.color }}>
                      Avg: {formatMoney(item.average)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={7}>
              {renderComparisonCard()}
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Compare months</h5>
                      <p className="text-muted small mb-0">Choose two payslips to compare side-by-side.</p>
                    </div>
                    <Badge bg="light" text="dark" className="rounded-pill px-3">
                      {filteredPayslips.length} options
                    </Badge>
                  </div>

                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Label className="fw-semibold small">Left month</Form.Label>
                      <Form.Select value={compareLeftId} onChange={(event) => setCompareLeftId(event.target.value)}>
                        {filteredPayslips.map((record) => (
                          <option key={record.id} value={record.id}>
                            {formatMonthYear(record)} - {formatMoney(calcRecord(record).net)}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={12}>
                      <Form.Label className="fw-semibold small">Right month</Form.Label>
                      <Form.Select value={compareRightId} onChange={(event) => setCompareRightId(event.target.value)}>
                        {filteredPayslips.map((record) => (
                          <option key={record.id} value={record.id}>
                            {formatMonthYear(record)} - {formatMoney(calcRecord(record).net)}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-0">
                  <div className="d-flex justify-content-between align-items-center p-4 pb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Monthly Payslips</h5>
                      <p className="text-muted small mb-0">Click a row to inspect the full salary breakdown.</p>
                    </div>
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                      {filteredPayslips.length} records
                    </Badge>
                  </div>

                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3">Month &amp; Year</th>
                        <th>Basic</th>
                        <th>Gross</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                        <th className="text-end px-4">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayslips.length > 0 ? (
                        filteredPayslips.map((record) => {
                          const metrics = calcRecord(record);

                          return (
                            <tr
                              key={record.id}
                              className={selectedPayslip?.id === record.id ? 'table-primary' : ''}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedPayslip(record);
                                setDetailsExpanded(true);
                              }}
                            >
                              <td className="px-4 fw-semibold">
                                <div className="d-flex align-items-center gap-2">
                                  {latestPayslip?.id === record.id && seenLatestPayrollId !== latestPayslip.id && (
                                    <Badge bg="warning" text="dark" className="rounded-pill">
                                      New
                                    </Badge>
                                  )}
                                  {formatMonthYear(record)}
                                </div>
                              </td>
                              <td>{formatMoney(metrics.basicSalary)}</td>
                              <td>{formatMoney(metrics.gross)}</td>
                              <td className="text-danger">{formatMoney(metrics.deductions)}</td>
                              <td className="fw-bold text-success">{formatMoney(metrics.net)}</td>
                              <td>
                                <Badge
                                  bg={
                                    record?.status === 'PAID'
                                      ? 'success'
                                      : record?.status === 'CANCELLED'
                                        ? 'danger'
                                        : 'warning'
                                  }
                                  className="rounded-pill px-3"
                                >
                                  {record?.status || 'UNPAID'}
                                </Badge>
                              </td>
                              <td className="text-end px-4">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  className="rounded-pill px-3"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedPayslip(record);
                                    setDetailsExpanded(true);
                                  }}
                                >
                                  <i className="bi bi-eye me-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            <i className="bi bi-search fs-2 d-block mb-2" />
                            No payslips match your search and filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 h-100 sticky-top" style={{ top: '1rem' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 d-lg-none">
                    <div className="text-muted small fw-semibold">Selected payslip details</div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => setDetailsExpanded((prev) => !prev)}
                    >
                      {detailsExpanded ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>

                  <div className="d-none d-lg-block mb-3 text-muted small fw-semibold">Selected payslip details</div>
                  <Collapse in={isDesktop || detailsExpanded}>
                    <div>{renderPayrollDetails()}</div>
                  </Collapse>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default MyPayslips;
