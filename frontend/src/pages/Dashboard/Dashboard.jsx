// import React, { useContext } from 'react';
// import { Row, Col, Card } from 'react-bootstrap';
// import { AuthContext } from '../../context/AuthContext';
// import studentImage from '../../assets/std.png';
// import employeeImage from '../../assets/emp.png';

// const Dashboard = () => {
//   const { user } = useContext(AuthContext);
//   const isStudent = user?.roles?.includes('ROLE_STUDENT');
//   const heroImage = isStudent ? studentImage : employeeImage;
//   const heroAlt = isStudent ? 'Student dashboard illustration' : 'Employee dashboard illustration';

//   // // Mock data for analytics
//   // const enrollments = [
//   //   { label: '2021', val: 780 },
//   //   { label: '2022', val: 920 },
//   //   { label: '2023', val: 1050 },
//   //   { label: '2024', val: 1120 },
//   //   { label: '2025', val: 1190 },
//   //   { label: '2026', val: 1245 }
//   // ];

//   // const financialData = [
//   //   { month: 'Jan', collected: 45, pending: 15 },
//   //   { month: 'Feb', collected: 52, pending: 10 },
//   //   { month: 'Mar', collected: 60, pending: 8 },
//   //   { month: 'Apr', collected: 48, pending: 22 },
//   //   { month: 'May', collected: 65, pending: 12 },
//   //   { month: 'Jun', collected: 70, pending: 5 }
//   // ];

//   // const employeeTypes = [
//   //   { type: 'Teaching Staff', count: 68, color: '#4318FF' }, // Primary Indigo
//   //   { type: 'Non-Teaching', count: 38, color: '#01B574' }, // Success Emerald
//   //   { type: 'Administration', count: 22, color: '#FFB547' } // Warning Yellow
//   // ];

//   // const totalEmployees = employeeTypes.reduce((acc, curr) => acc + curr.count, 0);

//   return (
//     <div className="container-fluid px-0">
//       <Row className="mb-4 align-items-center gy-4">
//         {/* <Col lg={7} xl={6}>
//           <Card className="border-0 shadow-sm rounded-4 h-100">
//             <Card.Body className="p-4">
//               <h2 className="text-dark fw-bold mb-2">Dashboard Overview</h2>
//               <p className="text-muted mb-4">Welcome back, <strong>{user?.username}</strong>! Your dashboard is tailored for quick access to ERP features.</p>

//               <Row className="g-3">
//                 <Col sm={6}>
//                   <div className="p-3 rounded-4 bg-primary bg-opacity-10 h-100">
//                     <h5 className="fw-semibold text-primary mb-2">Easy Navigation</h5>
//                     <p className="text-muted small mb-0">Jump to your main modules and reports faster.</p>
//                   </div>
//                 </Col>
//                 <Col sm={6}>
//                   <div className="p-3 rounded-4 bg-success bg-opacity-10 h-100">
//                     <h5 className="fw-semibold text-success mb-2">Role aware</h5>
//                     <p className="text-muted small mb-0">Viewing the dashboard as a {isStudent ? 'student' : 'staff'} user.</p>
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col> */}

//         <Col lg={5} xl={4}>
//           <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
//             <img
//               src={heroImage}
//               alt={heroAlt}
//               className="img-fluid w-100"
//               style={{ minHeight: 320, maxHeight: 360, objectFit: 'cover' }}
//             />
//           </Card>
//         </Col>
//       </Row>

//       {/* Overview Cards */}
//       {/* <Row className="g-4 mb-4">
//         <Col md={6} xl={3}>
//           <Card className="bg-primary text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
//             <Card.Body>
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Total Students</h6>
//                   <h2 className="mb-0 fw-bold">1,245</h2>
//                 </div>
//                 <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
//                   <i className="bi bi-people fs-4"></i>
//                 </div>
//               </div>
//             </Card.Body>
//             <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
//               <small className="text-white-50">View Details</small>
//               <small className="text-white"><i className="bi bi-arrow-right"></i></small>
//             </Card.Footer>
//           </Card>
//         </Col>
//         <Col md={6} xl={3}>
//           <Card className="bg-success text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
//             <Card.Body>
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Active Courses</h6>
//                   <h2 className="mb-0 fw-bold">42</h2>
//                 </div>
//                 <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
//                   <i className="bi bi-book fs-4"></i>
//                 </div>
//               </div>
//             </Card.Body>
//             <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
//               <small className="text-white-50">View Details</small>
//               <small className="text-white"><i className="bi bi-arrow-right"></i></small>
//             </Card.Footer>
//           </Card>
//         </Col>
//         <Col md={6} xl={3}>
//           <Card className="bg-warning text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
//             <Card.Body>
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Employees</h6>
//                   <h2 className="mb-0 fw-bold">128</h2>
//                 </div>
//                 <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
//                   <i className="bi bi-person-badge fs-4"></i>
//                 </div>
//               </div>
//             </Card.Body>
//             <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
//               <small className="text-white-50">View Details</small>
//               <small className="text-white"><i className="bi bi-arrow-right"></i></small>
//             </Card.Footer>
//           </Card>
//         </Col>
//         <Col md={6} xl={3}>
//           <Card className="bg-danger text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
//             <Card.Body>
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Pending Fees</h6>
//                   <h2 className="mb-0 fw-bold">$45K</h2>
//                 </div>
//                 <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
//                   <i className="bi bi-cash-stack fs-4"></i>
//                 </div>
//               </div>
//             </Card.Body>
//             <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
//               <small className="text-white-50">View Details</small>
//               <small className="text-white"><i className="bi bi-arrow-right"></i></small>
//             </Card.Footer>
//           </Card>
//         </Col>
//       </Row> */}

//       {/* Analytics Charts Row */}
      
//     </div>
//   );
// };

// export default Dashboard;




import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import studentImage from "../../assets/std.png";
import employeeImage from "../../assets/emp.png";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const isStudent = user?.roles?.includes("ROLE_STUDENT");

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 80px)",
        padding: "12px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 104px)",
          borderRadius: "4px",
          overflow: "hidden",
          background: "#fff",
          border: "1px solid #e2e8f0",
        }}
      >
        <img
          src={isStudent ? studentImage : employeeImage}
          alt="Dashboard Banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;