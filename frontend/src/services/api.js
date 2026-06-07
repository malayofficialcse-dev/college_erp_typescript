import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const stripAbsoluteApiUrl = (url = '') => {
  if (!/^https?:\/\//i.test(url)) return url;

  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/api\/v1/, '') + parsed.search;
  } catch {
    return url;
  }
};

const routeAliases = [
  [/^\/students(?:\/search)?(?=\/|$|\?)/, '/core/students'],
  [/^\/teachers(?:\/search)?(?=\/|$|\?)/, '/core/teachers'],
  [/^\/admissions\/emi(?=\/|$|\?)/, '/core/admission-emis'],
  [/^\/admission-emi(?=\/|$|\?)/, '/core/admission-emis'],
  [/^\/attendance(?=\/|$|\?)/, '/core/attendance'],
  [/^\/exam-results(?=\/|$|\?)/, '/core/exam-results'],
  [/^\/exam-schedules(?=\/|$|\?)/, '/core/exam-schedules'],
  [/^\/academic-features\/exam-schedules(?=\/|$|\?)/, '/core/exam-schedules'],
  [/^\/timetables(?=\/|$|\?)/, '/core/timetables'],
  [/^\/timetable(?=\/|$|\?)/, '/core/timetables'],
  [/^\/academics\/timetable\/all(?=\/|$|\?)/, '/core/timetables'],
  [/^\/academics\/timetable(?=\/|$|\?)/, '/core/timetables'],
  [/^\/sections(?=\/|$|\?)/, '/core/sections'],
  [/^\/sessions(?=\/|$|\?)/, '/core/sessions'],
  [/^\/subject-assignments(?=\/|$|\?)/, '/core/subject-assignments'],
  [/^\/academic-years(?=\/|$|\?)/, '/academic-years'],
  [/^\/semesters(?=\/|$|\?)/, '/semesters'],
  [/^\/subjects(?=\/|$|\?)/, '/subjects'],
  [/^\/courses(?=\/|$|\?)/, '/courses'],
  [/^\/classrooms(?=\/|$|\?)/, '/classrooms'],
  [/^\/employees(?:\/search)?(?=\/|$|\?)/, '/hr/employees'],
  [/^\/leaves(?:\/search)?(?=\/|$|\?)/, '/hr/leaves'],
  [/^\/payroll(?=\/|$|\?)/, '/hr/payrolls'],
  [/^\/resignations(?=\/|$|\?)/, '/hr/resignations'],
  [/^\/hr\/attendance(?=\/|$|\?)/, '/hr/staff-attendance'],
  [/^\/department\/getalldept(?=\/|$|\?)/, '/departments'],
  [/^\/department\/create(?=\/|$|\?)/, '/departments'],
];

const normalizeApiUrl = (url = '') => {
  const cleanUrl = stripAbsoluteApiUrl(url);
  const [path, query = ''] = cleanUrl.split('?');
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  for (const [pattern, replacement] of routeAliases) {
    if (pattern.test(normalizedPath)) {
      normalizedPath = normalizedPath.replace(pattern, replacement);
      break;
    }
  }

  return query ? `${normalizedPath}?${query}` : normalizedPath;
};

const shouldApplyDepartmentScope = (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get') return false;

  const path = (config.url || '').split('?')[0];
  return !path.startsWith('/auth') && !path.includes('/student-portal');
};

const appendDepartmentScope = (url = '', departmentId) => {
  if (!departmentId) return url;

  const [path, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  params.set('department', departmentId);
  params.set('departmentId', departmentId);
  const nextQuery = params.toString();
  return nextQuery ? `${path}?${nextQuery}` : path;
};

const normalizeDocumentIds = (value) => {
  if (Array.isArray(value)) return value.map(normalizeDocumentIds);
  if (!value || typeof value !== 'object') return value;

  const normalized = { ...value };
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id;
  }

  Object.keys(normalized).forEach((key) => {
    normalized[key] = normalizeDocumentIds(normalized[key]);
  });

  return normalized;
};

api.interceptors.request.use(
  (config) => {
    config.url = normalizeApiUrl(config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const isAdmin = storedUser?.roles?.includes('ROLE_ADMIN');
      if (!isAdmin && storedUser?.departmentId && shouldApplyDepartmentScope(config)) {
        config.url = appendDepartmentScope(config.url, storedUser.departmentId);
      }
    } catch {
      // Ignore malformed session data; backend still enforces scope from token.
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      Object.prototype.hasOwnProperty.call(response.data, 'success') &&
      Object.prototype.hasOwnProperty.call(response.data, 'data')
    ) {
      response.data = response.data.data;
    }
    response.data = normalizeDocumentIds(response.data);
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
