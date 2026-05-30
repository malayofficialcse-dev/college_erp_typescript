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
