// import React, { useEffect, useState } from 'react';


// const cardStyle = {
//   background: 'rgba(255,255,255,0.85)',
//   backdropFilter: 'blur(18px)',
//   boxShadow: '0 24px 68px rgba(15, 23, 42, 0.08)',
//   borderRadius: 32,
//   padding: '1.5rem',
//   width: 160,
//   textAlign: 'center',
// };

// const ERPLoading = () => {
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(timer);
//           return 100;
//         }
//         return prev + 1;
//       });
//     }, 40);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #f8fbff 0%, #dbeafe 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
//       <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
//         <div style={{ position: 'absolute', top: '3rem', left: '3rem', fontSize: '4.5rem' }}>⚙️</div>
//         <div style={{ position: 'absolute', bottom: '3rem', right: '3rem', fontSize: '4.5rem' }}>📈</div>
//       </div>

      

//       <div style={{ position: 'relative', width: 320, height: 320, marginBottom: '2.5rem', zIndex: 1 }}>
//         <svg width="320" height="320" viewBox="0 0 320 320" style={{ transform: 'rotate(-90deg)' }}>
//           <circle cx="160" cy="160" r="130" stroke="#e2e8f0" strokeWidth="15" fill="none" />
//           <circle
//             cx="160"
//             cy="160"
//             r="130"
//             stroke="#2563eb"
//             strokeWidth="15"
//             fill="none"
//             strokeDasharray={817}
//             strokeDashoffset={817 - (817 * progress) / 100}
//             strokeLinecap="round"
//           />
//         </svg>

//         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//           <h1 style={{ fontSize: '4.5rem', fontWeight: 800, color: '#1d4ed8', margin: 0 }}>ERP</h1>
//           <p style={{ color: '#475569', marginTop: '0.75rem', fontSize: '1rem' }}>Enterprise Resource Planning</p>
//           <div style={{ marginTop: '1.5rem', fontSize: '3rem' }}>💻</div>
//         </div>
//       </div>

//       <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#334155', marginBottom: '1rem', zIndex: 1 }}>Loading ERP, Please Wait...</h2>

//       <div style={{ width: '100%', maxWidth: 760, background: '#e2e8f0', borderRadius: 9999, height: 20, overflow: 'hidden', zIndex: 1 }}>
//         <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }} />
//       </div>

//       <div style={{ marginTop: '0.75rem', color: '#2563eb', fontWeight: 700, zIndex: 1 }}>{progress}%</div>

//       <p style={{ marginTop: '1rem', color: '#6b7280' }}>Optimizing your experience...</p>

//       <div style={{ position: 'absolute', bottom: '1.5rem', width: '100%', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
//         Student ERP Management System
//       </div>
//     </div>
//   );
// };

// export default ERPLoading;





import React, { useEffect, useState } from "react";

const ERPLoading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "30px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          border: "1px solid rgba(226,232,240,0.8)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decorations */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(59,130,246,0.08)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(37,99,235,0.06)",
          }}
        />

        {/* ERP Circle Loader */}
        {/* <div
          style={{
            position: "relative",
            width: "180px",
            height: "180px",
            margin: "0 auto 20px",
          }}
        >
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            style={{
              transform: "rotate(-90deg)",
            }}
          >
            <circle
              cx="90"
              cy="90"
              r="70"
              stroke="#e2e8f0"
              strokeWidth="10"
              fill="none"
            />

            <circle
              cx="90"
              cy="90"
              r="70"
              stroke="#2563eb"
              strokeWidth="10"
              fill="none"
              strokeDasharray="440"
              strokeDashoffset={440 - (440 * progress) / 100}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.3s ease",
              }}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#2563eb",
                margin: 0,
                letterSpacing: "1px",
              }}
            >
              ERP
            </h1> */}

            

            {/* <div
              style={{
                marginTop: "10px",
                fontSize: "22px",
              }}
            >
              🎓
            </div> 
          </div>
        </div> */}

        {/* Title */}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#334155",
            marginBottom: "12px",
          }}
        >
          Loading System...
        </h3>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#e2e8f0",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg,#2563eb,#3b82f6,#60a5fa)",
              transition: "width 0.3s ease",
              borderRadius: "999px",
            }}
          />
        </div>

        {/* Percentage */}
        <div
          style={{
            marginTop: "10px",
            color: "#2563eb",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          {progress}%
        </div>

        {/* Loading Message */}
        <p
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Optimizing your experience...
        </p>

        {/* ERP Modules */}
        {/* <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {[
            "Academics",
            "Finance",
            "HR",
            "Inventory",
            "Reports",
          ].map((item) => (
            <span
              key={item}
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                background: "#f1f5f9",
                fontSize: "11px",
                color: "#475569",
              }}
            >
              {item}
            </span>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default ERPLoading;