import PropTypes from 'prop-types';
import './EmptyState.css';

const EmptyState = ({
  icon = '📭',
  title = 'No Data',
  description = 'There is no data to display',
  action,
  onActionClick,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="empty-state-action" onClick={onActionClick}>
          {action}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.string,
  onActionClick: PropTypes.func,
};

export default EmptyState;
