import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import './DataTable.css';

const DataTable = ({
  columns = [],
  data = [],
  onSearch,
  onSort,
  paginated = true,
  itemsPerPage = 10,
  selectable = false,
  onSelectionChange,
  rowClassName = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    let result = [...data];

    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      if (onSearch) onSearch(result);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
      if (onSort) onSort(result, sortConfig);
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [data, searchTerm, sortConfig, columns, onSearch, onSort]);

  const handleSort = (columnKey) => {
    setSortConfig({
      key: columnKey,
      direction: sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIndices = new Set(paginatedData.map((_, i) => i + (currentPage - 1) * itemsPerPage));
      setSelectedRows(allIndices);
      if (onSelectionChange) onSelectionChange(Array.from(allIndices));
    } else {
      setSelectedRows(new Set());
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  const handleSelectRow = (index, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    if (onSelectionChange) onSelectionChange(Array.from(newSelected));
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = paginated
    ? filteredData.slice(startIndex, startIndex + itemsPerPage)
    : filteredData;

  return (
    <div className="datatable-wrapper">
      <div className="datatable-header">
        <input
          type="text"
          className="datatable-search"
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="datatable-count">
          {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="datatable-container">
        <table className="datatable">
          <thead>
            <tr>
              {selectable && (
                <th className="datatable-checkbox-th">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((_, i) =>
                        selectedRows.has(i + (currentPage - 1) * itemsPerPage)
                      )
                    }
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`datatable-th ${col.sortable ? 'datatable-sortable' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="datatable-header-content">
                    {col.label}
                    {col.sortable && (
                      <span className="datatable-sort-icon">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : (
                          '⇅'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="datatable-empty"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const globalIndex = index + (currentPage - 1) * itemsPerPage;
                return (
                  <tr
                    key={globalIndex}
                    className={`datatable-row ${rowClassName} ${
                      selectedRows.has(globalIndex) ? 'datatable-row-selected' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="datatable-checkbox-td">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(globalIndex)}
                          onChange={(e) => handleSelectRow(globalIndex, e)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="datatable-td">
                        {col.render
                          ? col.render(row[col.key], row, index)
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="datatable-footer">
          <button
            className="datatable-page-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="datatable-page-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            className="datatable-page-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    })
  ),
  data: PropTypes.arrayOf(PropTypes.object),
  onSearch: PropTypes.func,
  onSort: PropTypes.func,
  paginated: PropTypes.bool,
  itemsPerPage: PropTypes.number,
  selectable: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  rowClassName: PropTypes.string,
};

export default DataTable;
