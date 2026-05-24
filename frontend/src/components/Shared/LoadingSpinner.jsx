import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullPage = false, size = 'md', overlay = true }) => {
  if (fullPage) {
    return (
      <div className={`spinner-overlay ${overlay ? 'spinner-overlay-visible' : ''}`}>
        <div className={`spinner-container spinner-${size}`}>
          <div className="spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  fullPage: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  overlay: PropTypes.bool,
};

export default LoadingSpinner;
