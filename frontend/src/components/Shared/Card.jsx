import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ children, header, footer, className = '', onClick }) => {
  return (
    <div className={`card-wrapper ${className}`} onClick={onClick}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
