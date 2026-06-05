import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import api from '../../services/api';

const getId = (item) => item?.id || item?._id || '';

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const getValue = (item, path) => {
  if (!path) return '';
  return path.split('.').reduce((value, key) => value?.[key], item);
};

const getLabel = (item, paths = ['name', 'code']) => {
  const values = paths.map((path) => getValue(item, path)).filter(Boolean);
  return values.length ? values.join(' - ') : getId(item);
};

const getDerivedValue = (item, field) => {
  if (field.deriveValue) return field.deriveValue(item);
  return getValue(item, field.name);
};

const getFilterValue = (item, filter) => {
  if (filter.deriveValue) return filter.deriveValue(item);
  if (filter.path) return getValue(item, filter.path);
  return getValue(item, filter.name);
};

const emptyForm = (fields) =>
  fields.reduce((form, field) => {
    form[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
    return form;
  }, {});

const CoreResourcePage = ({ title, endpoint, icon, fields, columns, relations = {}, filters }) => {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [current, setCurrent] = useState(() => emptyForm(fields));
  const [filterValues, setFilterValues] = useState(() =>
    (filters || []).reduce((state, filter) => ({ ...state, [filter.name]: filter.defaultValue || '' }), {})
  );

  const selectFields = useMemo(() => fields.filter((field) => field.type === 'select'), [fields]);
  const activeFilters = useMemo(() => (filters || []).filter((filter) => filter.type === 'select'), [filters]);

  const fetchItems = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await api.get(endpoint);
      setItems(asArray(response.data));
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    const entries = await Promise.all(
      Object.entries(relations).map(async ([key, config]) => {
        try {
          const response = await api.get(config.endpoint);
          return [key, asArray(response.data)];
        } catch {
          return [key, []];
        }
      })
    );
    setOptions(Object.fromEntries(entries));
  };

  useEffect(() => {
    fetchItems();
    if (selectFields.length) fetchOptions();
  }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFilterValues((filters || []).reduce((state, filter) => ({ ...state, [filter.name]: filter.defaultValue || '' }), {}));
  }, [filters]);

  const openAdd = () => {
    setIsEdit(false);
    setCurrent(emptyForm(fields));
    setShowModal(true);
  };

  const openEdit = (item) => {
    const form = emptyForm(fields);
    fields.forEach((field) => {
      if (field.type === 'select') {
        const value = getDerivedValue(item, field);
        form[field.name] = getId(value) || value || '';
      } else if (field.type === 'date') {
        const value = getDerivedValue(item, field);
        form[field.name] = value ? String(value).slice(0, 10) : '';
      } else {
        form[field.name] = getDerivedValue(item, field) ?? form[field.name];
      }
    });
    form.id = getId(item);
    setIsEdit(true);
    setCurrent(form);
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCurrent((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const buildPayload = () => {
    return fields.reduce((payload, field) => {
      const value = current[field.name];
      if (field.optional && (value === '' || value === null || value === undefined)) return payload;
      const key = field.payloadKey ?? field.name;
      if (field.type === 'number') payload[key] = Number(value);
      else if (field.type === 'date') payload[key] = value ? new Date(value) : value;
      else payload[key] = value;
      return payload;
    }, {});
  };

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const payload = buildPayload();
      if (isEdit) await api.put(`${endpoint}/${current.id}`, payload);
      else await api.post(endpoint, payload);
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to save ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, '')}?`)) return;
    try {
      await api.delete(`${endpoint}/${getId(item)}`);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to delete ${title.toLowerCase()}.`);
    }
  };

  const renderCell = (item, column) => {
    if (column.render) return column.render(item);
    const value = getValue(item, column.key);
    if (typeof value === 'boolean') {
      return <Badge bg={value ? 'success' : 'secondary'}>{value ? 'Active' : 'Inactive'}</Badge>;
    }
    return value || 'N/A';
  };

  const filteredItems = items.filter((item) =>
    activeFilters.every((filter) => {
      const selectedValue = filterValues[filter.name];
      if (!selectedValue) return true;
      const itemValue = getFilterValue(item, filter);
      return String(itemValue || '') === String(selectedValue);
    })
  );

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{title}</h2>
        <Button variant="primary" onClick={openAdd}>
          <i className={`bi ${icon || 'bi-plus-lg'} me-2`}></i>Add
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeFilters.length > 0 && (
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <Row className="g-3 align-items-end">
              {activeFilters.map((filter) => (
                <Col md={filter.cols || 4} key={filter.name}>
                  <Form.Group>
                    <Form.Label>{filter.label}</Form.Label>
                    <Form.Select
                      value={filterValues[filter.name] || ''}
                      onChange={(event) => setFilterValues((prev) => ({ ...prev, [filter.name]: event.target.value }))}
                    >
                      <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                      {(options[filter.options] || []).map((option) => (
                        <option key={getId(option) || option.value} value={getId(option) || option.value}>
                          {option.label || getLabel(option, relations[filter.options]?.labelPaths)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              ))}
              <Col md={12} className="d-flex justify-content-end">
                <Button
                  variant="link"
                  className="text-danger text-decoration-none p-0"
                  onClick={() => setFilterValues(filters.reduce((state, filter) => ({ ...state, [filter.name]: filter.defaultValue || '' }), {}))}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={column.className}>{column.label}</th>
                ))}
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-5">
                    <Spinner animation="border" size="sm" className="me-2" /> Loading
                  </td>
                </tr>
              ) : filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr key={getId(item)}>
                    {columns.map((column) => (
                      <td key={column.key} className={column.className}>{renderCell(item, column)}</td>
                    ))}
                    <td className="text-end px-4">
                      <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => openEdit(item)}>
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => deleteItem(item)}>
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-5 text-muted">No records found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? `Edit ${title}` : `Create ${title}`}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveItem}>
          <Modal.Body>
            <Row className="g-3">
              {fields.map((field) => (
                <Col md={field.cols || 6} key={field.name}>
                  <Form.Group>
                    {field.type !== 'checkbox' && <Form.Label>{field.label}</Form.Label>}
                    {field.type === 'select' ? (
                      <Form.Select name={field.name} value={current[field.name]} onChange={handleChange} required={!field.optional}>
                        <option value="">{field.placeholder || `Select ${field.label}`}</option>
                        {(field.optionsList || options[field.options] || []).map((option) => (
                          <option key={getId(option) || option.value} value={getId(option) || option.value}>
                            {option.label || getLabel(option, relations[field.options]?.labelPaths)}
                          </option>
                        ))}
                      </Form.Select>
                    ) : field.type === 'checkbox' ? (
                      <Form.Check type="checkbox" label={field.label} name={field.name} checked={Boolean(current[field.name])} onChange={handleChange} />
                    ) : (
                      <Form.Control
                        as={field.type === 'textarea' ? 'textarea' : 'input'}
                        rows={field.type === 'textarea' ? 3 : undefined}
                        type={field.type === 'textarea' ? undefined : field.type || 'text'}
                        name={field.name}
                        value={current[field.name]}
                        onChange={handleChange}
                        required={!field.optional}
                      />
                    )}
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CoreResourcePage;
