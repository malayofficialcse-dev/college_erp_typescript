import PropTypes from 'prop-types';
import './Badge.css';

const Badge = ({
  children,
  color = 'primary',
  size = 'md',
  variant = 'solid',
  className = '',
}) => {
  const badgeClasses = [
    'badge',
    `badge-${color}`,
    `badge-${size}`,
    `badge-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={badgeClasses}>{children}</span>;
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['solid', 'outline', 'light']),
  className: PropTypes.string,
};

export default Badge;
