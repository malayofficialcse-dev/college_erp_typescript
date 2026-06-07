import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown, Form, Collapse } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getPageKeyFromPath, PAGE_BY_KEY } from '../config/pagePermissions';
import './Layout.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Layout = () => {
  const { user, logout, hasPermission } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarToggled, setSidebarToggled] = useState(false);
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  const toggleSidebar = () => setSidebarToggled(!isSidebarToggled);

  const [openMenus, setOpenMenus] = useState({});

  const canViewPage = (path) => {
    const pageKey = getPageKeyFromPath(path);
    if (!pageKey) return true;
    if (PAGE_BY_KEY[pageKey]?.alwaysVisible) return true;
    return hasPermission(pageKey, 'view');
  };

  const navCategories = [
    {
      title: 'Main',
      isGroup: false,
      items: [
        { path: '/dashboard', name: 'Dashboard', icon: 'bi-grid-1x2-fill' },
      ]
    },
    {
      title: 'Academics',
      icon: 'bi-mortarboard-fill',
      isGroup: true,
      items: [
        { path: '/academic-years', name: 'Academic Years', icon: 'bi-calendar-range' },
        { path: '/semesters', name: 'Semesters', icon: 'bi-list-ol' },
        { path: '/teachers', name: 'Teachers', icon: 'bi-person-workspace' },
        { path: '/courses', name: 'Courses', icon: 'bi-journal-bookmark-fill' },
        { path: '/subjects', name: 'Subjects', icon: 'bi-book-half' },
        { path: '/timetable', name: 'Timetable', icon: 'bi-calendar3' },
        { path: '/attendance', name: 'Attendance', icon: 'bi-calendar-check-fill' },
        { path: '/exam-schedules', name: 'Exam Schedules', icon: 'bi-calendar-event' },
        { path: '/exam-results', name: 'Exam Results', icon: 'bi-award-fill' },
      ]
    },
    {
      title: 'Admission',
      icon: 'bi-mortarboard-fill',
      isGroup: true,
      items: [
        { path: '/counseling', name: 'Counseling', icon: 'bi-headset' },
        { path: '/admissions', name: 'Admissions', icon: 'bi-mortarboard-fill' },
        { path: '/students', name: 'Admitted Students', icon: 'bi-person-badge-fill' },
      ]
    },
    {
      title: 'Core System',
      icon: 'bi-gear-wide-connected',
      isGroup: true,
      items: [
        //{ path: '/core/counseling', name: 'Counseling', icon: 'bi-headset' },
        //{ path: '/core/admissions', name: 'Admissions', icon: 'bi-mortarboard-fill' },
        { path: '/core/academic-years', name: 'Academic Years', icon: 'bi-calendar-range' },
        { path: '/core/semesters', name: 'Semesters', icon: 'bi-list-ol' },
        { path: '/core/departments', name: 'Departments', icon: 'bi-building-fill' },
        { path: '/core/courses', name: 'Courses', icon: 'bi-journal-bookmark-fill' },
        { path: '/core/students', name: 'Students', icon: 'bi-person-badge-fill' },
        { path: '/core/teachers', name: 'Teachers', icon: 'bi-person-workspace' },
        { path: '/core/subjects', name: 'Subjects', icon: 'bi-book-half' },
        { path: '/core/classrooms', name: 'Classrooms', icon: 'bi-door-open-fill' },
        { path: '/core/sections', name: 'Sections', icon: 'bi-diagram-3-fill' },
        { path: '/core/sessions', name: 'Sessions', icon: 'bi-calendar2-week-fill' },
        { path: '/core/subject-assignments', name: 'Subject Assignments', icon: 'bi-person-lines-fill' },
        { path: '/core/timetable', name: 'Timetable', icon: 'bi-calendar3' },
        { path: '/core/attendance', name: 'Attendance', icon: 'bi-calendar-check-fill' },
        { path: '/core/exam-schedules', name: 'Exam Schedules', icon: 'bi-calendar-event' },
        { path: '/core/exam-results', name: 'Exam Results', icon: 'bi-award-fill' },
      ]
    },
    {
      title: 'Student Portal',
      icon: 'bi-backpack-fill',
      isGroup: true,
      items: [
        { path: '/student-portal/my-grades', name: 'My Grades', icon: 'bi-award' },
        { path: '/student-portal/my-attendance', name: 'My Attendance', icon: 'bi-calendar-check' },
        { path: '/student-portal/my-fees', name: 'My Fees', icon: 'bi-receipt' },
        { path: '/student-portal/my-timetable', name: 'My Timetable', icon: 'bi-calendar3' },
        { path: '/student-portal/my-exams', name: 'My Exams', icon: 'bi-calendar-event' },
      ]
    },
    {
      title: 'Employee Centre',
      icon: 'bi-person-circle',
      isGroup: true,
      items: [
        { path: '/my-profile', name: 'My Profile', icon: 'bi-person-fill' },
        { path: '/my-leaves', name: 'My Leaves', icon: 'bi-calendar2-heart' },
        { path: '/my-attendance', name: 'My Attendance', icon: 'bi-calendar-check' },
        { path: '/my-payslips', name: 'My Payslips', icon: 'bi-file-earmark-text-fill' },
        { path: '/my-resignation', name: 'My Resignation', icon: 'bi-door-open' },
      ]
    },
    {
      title: 'HR & Admin',
      icon: 'bi-people-fill',
      isGroup: true,
      items: [
        { path: '/employees', name: 'Staff Registry', icon: 'bi-person-vcard-fill' },
        { path: '/staff-attendance', name: 'Staff Attendance', icon: 'bi-person-check' },
        { path: '/hr-leave-inbox', name: 'Leave Inbox', icon: 'bi-inbox-fill' },
        { path: '/hr-resignation-inbox', name: 'Resignation Inbox', icon: 'bi-door-closed-fill' },
        { path: '/leaves', name: 'All Leave Requests', icon: 'bi-calendar2-x' },
        { path: '/leave-approvals', name: 'Leave Approvals', icon: 'bi-check-circle' },
        { path: '/payroll', name: 'Payroll', icon: 'bi-wallet2' },
        { path: '/user-management', name: 'User Management', icon: 'bi-shield-lock-fill' },
      ]
    },
    {
      title: 'Finance',
      icon: 'bi-cash-coin',
      isGroup: true,
      items: [
        { path: '/fees', name: 'Transaction List', icon: 'bi-receipt-cutoff' },
        { path: '/payment-analysis', name: 'Payment Analysis', icon: 'bi-bar-chart-fill' },
        { path: '/fee-invoices', name: 'Fee Invoices', icon: 'bi-receipt' },
        { path: '/scholarships', name: 'Scholarships', icon: 'bi-gift-fill' },
      ]
    },
    {
      title: 'Facilities',
      icon: 'bi-buildings-fill',
      isGroup: true,
      items: [
        { path: '/library', name: 'Library', icon: 'bi-journal-bookmark' },
        { path: '/book-reservations', name: 'Book Reservations', icon: 'bi-bookmark-plus' },
        { path: '/hostel', name: 'Hostel', icon: 'bi-house-heart-fill' },
        { path: '/transport', name: 'Transport', icon: 'bi-bus-front-fill' },
      ]
    },
    {
      title: 'Communication',
      icon: 'bi-chat-quote-fill',
      isGroup: true,
      items: [
        { path: '/notices', name: 'Notice Board', icon: 'bi-megaphone-fill' },
        { path: '/events', name: 'Events', icon: 'bi-calendar-event-fill' },
        { path: '/event-registrations', name: 'Event Registrations', icon: 'bi-ui-checks' },
        { path: '/notifications', name: 'Notifications', icon: 'bi-bell-fill' },
      ]
    },
    {
      title: 'Reports',
      isGroup: false,
      items: [
        { path: '/reports', name: 'Reports & Analytics', icon: 'bi-bar-chart-line-fill' },
      ]
    }
  ];

  const filteredNavCategories = navCategories.map(category => {
    const filteredItems = category.items.filter(item => canViewPage(item.path));
    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  React.useEffect(() => {
    const activeCategory = filteredNavCategories.find(c =>
      c.items?.some(item => location.pathname.startsWith(item.path))
    );
    if (activeCategory && activeCategory.isGroup && !openMenus[activeCategory.title]) {
      setOpenMenus(prev => ({ ...prev, [activeCategory.title]: true }));
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('user-management')) return 'User Access Control';
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('students')) return 'Student Directory';
    if (path.includes('employees')) return 'Employee Directory';
    if (path.includes('courses')) return 'Course Directory';
    if (path.includes('departments')) return 'Departments';
    if (path.includes('classrooms')) return 'Classrooms';
    if (path.includes('sections')) return 'Sections';
    if (path.includes('sessions')) return 'Academic Sessions';
    if (path.includes('subject-assignments')) return 'Subject Assignments';
    if (path.includes('teachers')) return 'Faculty List';
    if (path.includes('subjects')) return 'Subject Management';
    if (path.includes('academic-years')) return 'Academic Years';
    if (path.includes('semesters')) return 'Semesters';
    if (path.includes('admissions')) return 'Admissions';
    if (path.includes('attendance')) return 'Attendance Registry';
    if (path.includes('exam-results')) return 'Examination Results';
    if (path.includes('timetable')) return 'Class Timetable';
    if (path.includes('exam-schedules')) return 'Exam Schedules';
    if (path.includes('notices')) return 'Notice Board';
    if (path.includes('events')) return 'Campus Events';
    if (path.includes('event-registrations')) return 'Event Registrations';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('leaves')) return 'Leave Applications';
    if (path.includes('leave-approvals')) return 'Leave Approvals Workflow';
    if (path.includes('staff-attendance')) return 'Staff Attendance';
    if (path.includes('payroll')) return 'Payroll & Salary Management';
    if (path.includes('fees')) return 'Fee Payments & Invoices';
    if (path.includes('fee-invoices')) return 'Fee Invoices';
    if (path.includes('scholarships')) return 'Scholarships & Awards';
    if (path.includes('library')) return 'Library Management';
    if (path.includes('book-reservations')) return 'Book Reservations';
    if (path.includes('hostel')) return 'Hostel & Housing Allocation';
    if (path.includes('transport')) return 'Transportation Routes';
    if (path.includes('student-portal/my-grades')) return 'My Grades';
    if (path.includes('student-portal/my-attendance')) return 'My Attendance';
    if (path.includes('student-portal/my-fees')) return 'My Fees';
    if (path.includes('student-portal/my-timetable')) return 'My Timetable';
    if (path.includes('student-portal/my-exams')) return 'My Exam Schedule';
    return 'ERP Portal';
  };

  return (
    <div className={`d-flex ${isSidebarToggled ? 'toggled' : ''}`} id="wrapper">
      {/* Sidebar */}
      <div className="shadow-sm" id="sidebar-wrapper">
        <div className="sidebar-heading">
          <i className="bi bi-hexagon-fill me-2 text-primary"></i>
          ERP Pro
          <button
            aria-label="Close sidebar"
            className="btn btn-sm sidebar-close-btn d-none d-md-inline-flex"
            onClick={toggleSidebar}
            style={{ marginLeft: 'auto' }}
          >
            <i className="bi bi-x-lg" style={{ fontSize: '0.9rem' }}></i>
          </button>
        </div>
        <div className="list-group list-group-flush mt-2">
          {filteredNavCategories.map((category, index) => {
            if (!category.isGroup) {
              return (
                <React.Fragment key={index}>
                  {category.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`list-group-item list-group-item-action ${location.pathname.startsWith(item.path) ? 'active-link' : ''}`}
                    >
                      <i className={`bi ${item.icon} fs-5`}></i>
                      {item.name}
                    </Link>
                  ))}
                </React.Fragment>
              );
            }

            const isOpen = openMenus[category.title];
            return (
              <div key={index} className="sidebar-group-container">
                <div
                  className={`list-group-item list-group-item-action sidebar-group-header ${isOpen ? 'expanded' : ''}`}
                  onClick={() => toggleMenu(category.title)}
                  style={{ cursor: 'pointer', paddingRight: '1.2rem', justifyContent: 'space-between', border: 'none' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${category.icon} fs-5`}></i>
                    {category.title}
                  </div>
                  <i
                    className={`bi bi-chevron-down text-muted`}
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
                      fontSize: '0.8rem'
                    }}
                  ></i>
                </div>
                <Collapse in={isOpen}>
                  <div className="sidebar-subgroup mt-1 mb-2">
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`list-group-item list-group-item-action subgroup-item ${location.pathname.startsWith(item.path) ? 'active-link' : ''}`}
                      >
                        <div className="subgroup-dot"></div>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </Collapse>
              </div>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div id="page-content-wrapper" className="d-flex flex-column min-vh-100">
        <Navbar expand="lg" className="top-navbar shadow-sm sticky-top">
          <Container fluid className="px-3">
            <div className="d-flex align-items-center flex-grow-1">
              {/* Hamburger button - always visible */}
              <button className="btn btn-light border-0 me-3" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <i className="bi bi-list fs-4"></i>
              </button>

              {/* Breadcrumbs and Page Title */}
              <div className="d-none d-md-block me-4">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-1" style={{ fontSize: '0.75rem' }}>
                    <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
                    <li className="breadcrumb-item active text-primary" aria-current="page">{getPageTitle()}</li>
                  </ol>
                </nav>
                <h5 className="mb-0 fw-bold text-dark">{getPageTitle()}</h5>
              </div>



            </div>

            <div className="d-flex align-items-center ms-auto">
              {/* System Connectivity Status */}
              <div className="system-status-indicator d-none d-sm-inline-flex me-4">
                <span className="status-dot"></span>
                <span>System: Online</span>
              </div>

              {/* Quick Actions Dropdown */}
              <Dropdown className="me-3">
                <Dropdown.Toggle variant="light" id="quick-actions-dropdown" className="btn-sm rounded-pill px-3 fw-semibold border-0 d-flex align-items-center gap-1">
                  <i className="bi bi-plus-circle text-primary"></i>
                  <span className="d-none d-md-inline">Quick Actions</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow border-0 mt-2" style={{ borderRadius: 'var(--radius-md)' }}>
                  <Dropdown.Header className="fw-bold">{isStudent ? 'Notices' : 'Create New'}</Dropdown.Header>
                  {isStudent ? (
                    <Dropdown.Item as={Link} to="/notices"><i className="bi bi-megaphone me-2"></i>Notices</Dropdown.Item>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} to="/students"><i className="bi bi-mortarboard me-2"></i>New Student</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employees"><i className="bi bi-person-badge me-2"></i>New Staff Onboarding</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/notices"><i className="bi bi-megaphone me-2"></i>Post Notice</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/leaves"><i className="bi bi-calendar2-x me-2"></i>Apply Leave</Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>

              {/* Notifications */}
              <Dropdown className="me-3">
                <Dropdown.Toggle variant="transparent" id="notifications-dropdown" className="position-relative cursor-pointer text-secondary hover-primary border-0 p-0 shadow-none d-flex align-items-center">
                  <i className="bi bi-bell fs-5"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                    3
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow border-0 mt-2 p-0" style={{ width: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }} align="end">
                  <div className="px-3 py-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark small">Notifications</span>
                    <a href="#/all-notifications" className="text-primary text-decoration-none small" style={{ fontSize: '0.75rem' }}>Mark all read</a>
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <Dropdown.Item className="py-2.5 px-3 border-bottom text-wrap">
                      <div className="fw-semibold text-dark small">New Notice Posted</div>
                      <small className="text-muted">Semester registration has been rescheduled to next Monday.</small>
                    </Dropdown.Item>
                    <Dropdown.Item className="py-2.5 px-3 border-bottom text-wrap">
                      <div className="fw-semibold text-dark small">Leave Request Approved</div>
                      <small className="text-muted">Your casual leave request has been approved by HR.</small>
                    </Dropdown.Item>
                    <Dropdown.Item className="py-2.5 px-3 text-wrap">
                      <div className="fw-semibold text-dark small">Library Due Reminder</div>
                      <small className="text-muted">Please return "Database Systems" to avoid fine charges.</small>
                    </Dropdown.Item>
                  </div>
                  <div className="bg-light text-center py-2 border-top">
                    <a href="#/notifications" className="text-secondary text-decoration-none small fw-medium">View All Alerts</a>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Day/Night Mode Toggle */}
              <div className="d-flex align-items-center me-4">
                <i className={`bi bi-sun-fill me-2 ${theme === 'light' ? 'text-warning' : 'text-secondary'}`}></i>
                <Form.Check
                  type="switch"
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  className="mb-0"
                />
                <i className={`bi bi-moon-stars-fill ms-2 ${theme === 'dark' ? 'text-primary' : 'text-secondary'}`}></i>
              </div>

              {/* User Dropdown Profile */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="transparent" id="dropdown-basic" className="d-flex align-items-center border-0 shadow-none p-0">
                  <div className="me-3 text-end d-none d-md-block">
                    <div className="fw-bold mb-0 lh-1" style={{ color: 'var(--text-primary)' }}>{user?.username || 'Admin User'}</div>
                    <small style={{ color: 'var(--text-secondary)' }}>{user?.roles?.[0] || 'Administrator'}</small>
                  </div>
                  <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow border-0 mt-2" style={{ borderRadius: 'var(--radius-md)' }}>
                  <div className="px-3 py-2 text-dark border-bottom d-md-none">
                    <div className="fw-bold">{user?.username || 'Admin User'}</div>
                    <small className="text-muted">{user?.roles?.[0] || 'Administrator'}</small>
                  </div>
                  <Dropdown.Item href="#/profile"><i className="bi bi-person me-2"></i>My Profile</Dropdown.Item>
                  <Dropdown.Item href="#/settings"><i className="bi bi-gear me-2"></i>System Config</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Container>
        </Navbar>

        {/* Main Content Area */}
        <div className="main-content flex-grow-1 d-flex flex-column">
          <div className="container-fluid flex-grow-1 mb-4">
            <Outlet />
          </div>

          {/* Professional Grid Footer */}
          <footer className="footer py-4 px-4 mt-auto border-top" style={{ background: 'var(--surface-color)' }}>
            <Container fluid className="px-0">
              <div className="row g-4 mb-3">
                <div className="col-md-6 col-lg-4">
                  <div className="footer-logo-text mb-2">
                    <i className="bi bi-hexagon-fill me-2 text-primary"></i>ERP Pro
                  </div>
                  <p className="text-muted small mb-2" style={{ maxWidth: '280px' }}>
                    A unified institution resource planning suite designed for managing students, faculty, academics, HR, and campus assets efficiently.
                  </p>
                  <span className="system-status-indicator" style={{ fontSize: '0.7rem' }}>
                    <span className="status-dot"></span>
                    <span>All services operational</span>
                  </span>
                </div>
                <div className="col-6 col-lg-2 ms-lg-auto">
                  <h6 className="text-uppercase fw-bold text-dark mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Modules</h6>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2" style={{ fontSize: '0.8rem' }}>
                    <li><Link to="/students" className="footer-link">Students</Link></li>
                    <li><Link to="/courses" className="footer-link">Courses & Labs</Link></li>
                    <li><Link to="/employees" className="footer-link">Staff Registry</Link></li>
                    <li><Link to="/fees" className="footer-link">Finance Hub</Link></li>
                  </ul>
                </div>
                <div className="col-6 col-lg-2">
                  <h6 className="text-uppercase fw-bold text-dark mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Support</h6>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2" style={{ fontSize: '0.8rem' }}>
                    <li><a href="#/docs" className="footer-link">User Manual</a></li>
                    <li><a href="#/tickets" className="footer-link">Submit Ticket</a></li>
                    <li><a href="#/help" className="footer-link">Knowledgebase</a></li>
                    <li><a href="#/updates" className="footer-link">System Changelog</a></li>
                  </ul>
                </div>
                <div className="col-md-6 col-lg-3">
                  <h6 className="text-uppercase fw-bold text-dark mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Enterprise Portal</h6>
                  <p className="text-muted small mb-3">
                    Need assistance? Get in touch with the Institutional Admin Desk.
                  </p>
                  <a href="mailto:admin@institution.edu" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-envelope-fill me-2"></i>Contact Admin
                  </a>
                </div>
              </div>
              <div className="border-top pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                <span className="mb-2 mb-md-0">
                  © {new Date().getFullYear()} <span className="fw-semibold text-primary">ERP Pro</span>. Crafted for modern institutional management.
                </span>
                <div className="d-flex gap-3">
                  <a href="#/privacy" className="footer-link">Privacy Policy</a>
                  <span>•</span>
                  <a href="#/terms" className="footer-link">Terms of Service</a>
                  <span>•</span>
                  <span className="fw-medium">v1.2.0</span>
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
