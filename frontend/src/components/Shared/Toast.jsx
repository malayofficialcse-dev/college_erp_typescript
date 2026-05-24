import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import './Toast.css';

let toastId = 0;

const toastStack = [];
const listeners = [];

export const showToast = (message, type = 'info', duration = 5000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toastStack.push(toast);
  listeners.forEach((listener) => listener([...toastStack]));

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

export const removeToast = (id) => {
  const index = toastStack.findIndex((t) => t.id === id);
  if (index > -1) {
    toastStack.splice(index, 1);
    listeners.forEach((listener) => listener([...toastStack]));
  }
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleUpdate = (updatedToasts) => {
      setToasts(updatedToasts);
    };

    listeners.push(handleUpdate);
    return () => {
      listeners.splice(listeners.indexOf(handleUpdate), 1);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type} toast-enter`}>
          <div className="toast-content">
            <span className="toast-icon">{getIcon(toast.type)}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
};

Toast.propTypes = {};

export default Toast;
