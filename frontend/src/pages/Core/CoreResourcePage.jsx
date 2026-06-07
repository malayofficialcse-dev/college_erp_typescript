import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import api from '../../services/api';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getId = (item) => item?.id || item?._id || '';

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
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

/* ─── status colour map ───────────────────────────────────────────────────── */
const STATUS_COLOURS = {
  PRESENT:  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  ABSENT:   { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  LATE:     { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  EXCUSED:  { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' },
  ACTIVE:   { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  INACTIVE: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
  PAID:     { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  PENDING:  { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  FAILED:   { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

const StatusChip = ({ value, selected, onClick }) => {
  const style = STATUS_COLOURS[value] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 14px',
        borderRadius: 20,
        border: `2px solid ${selected ? style.color : style.border}`,
        background: selected ? style.color : style.bg,
        color: selected ? '#fff' : style.color,
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all .15s',
        outline: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </button>
  );
};

/* ─── multi-select dropdown ──────────────────────────────────────────────── */
const MultiSelectDropdown = ({ label, options: opts, selected, onChange, labelPaths }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    onChange(next);
  };

  const displayText = selected.length === 0
    ? `All ${label}`
    : selected.length === 1
      ? (opts.find((o) => (getId(o) || o.value) === selected[0]) && getLabel(opts.find((o) => (getId(o) || o.value) === selected[0]), labelPaths)) || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid #ced4da',
          background: selected.length ? '#eef2ff' : '#fff',
          color: selected.length ? '#4338ca' : '#6b7280',
          fontWeight: selected.length ? 600 : 400,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayText}</span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'} ms-2`} style={{ flexShrink: 0 }}></i>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 1050,
          top: '110%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          maxHeight: 220,
          overflowY: 'auto',
          padding: '6px 0',
        }}>
          {opts.length === 0 && (
            <div style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 13 }}>No options</div>
          )}
          {opts.map((opt) => {
            const id = getId(opt) || opt.value;
            const lbl = opt.label || getLabel(opt, labelPaths);
            const isSelected = selected.includes(id);
            return (
              <div
                key={id}
                onClick={() => toggle(id)}
                style={{
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  background: isSelected ? '#eef2ff' : 'transparent',
                  color: isSelected ? '#4338ca' : '#1f2937',
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background .1s',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `2px solid ${isSelected ? '#4f46e5' : '#d1d5db'}`,
                  background: isSelected ? '#4f46e5' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isSelected && <i className="bi bi-check" style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}></i>}
                </div>
                {lbl}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CoreResourcePage
═══════════════════════════════════════════════════════════════════════════ */
const CoreResourcePage = ({ title, endpoint, icon, fields, columns, relations = {}, filters }) => {
  const [items, setItems]         = useState([]);
  const [options, setOptions]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit]       = useState(false);
  const [current, setCurrent]     = useState(() => emptyForm(fields));

  /* ── filter state ─────────────────────────────────────────────────────── */
  const [search, setSearch]             = useState('');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  // multi-select: { [filterName]: string[] }
  const [multiValues, setMultiValues]   = useState({});
  // status chip multi-select: string[]
  const [statusSelected, setStatusSelected] = useState([]);

  const selectFields  = useMemo(() => fields.filter((f) => f.type === 'select'), [fields]);

  // Identify which filter kinds exist
  const multiFilters  = useMemo(() => (filters || []).filter((f) => f.type === 'multiselect'), [filters]);
  const statusFilter  = useMemo(() => (filters || []).find((f) => f.type === 'statuschips'),   [filters]);
  const hasDateFilter = useMemo(() => (filters || []).some((f) => f.type === 'daterange'),       [filters]);
  const searchFilter  = useMemo(() => (filters || []).find((f) => f.type === 'search'),          [filters]);
  const hasAnyFilter  = (filters || []).length > 0;

  /* ── data loading ─────────────────────────────────────────────────────── */
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

  /* ── form helpers ─────────────────────────────────────────────────────── */
  const openAdd = () => { setIsEdit(false); setCurrent(emptyForm(fields)); setShowModal(true); };

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrent((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const buildPayload = () =>
    fields.reduce((payload, field) => {
      const value = current[field.name];
      if (field.optional && (value === '' || value === null || value === undefined)) return payload;
      const key = field.payloadKey ?? field.name;
      if (field.type === 'number') payload[key] = Number(value);
      else if (field.type === 'date') payload[key] = value ? new Date(value) : value;
      else payload[key] = value;
      return payload;
    }, {});

  const saveItem = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const payload = buildPayload();
      if (isEdit) await api.put(`${endpoint}/${current.id}`, payload);
      else await api.post(endpoint, payload);
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error('Save error:', err.response?.data || err);
      const serverData = err.response?.data;
      let msg = err.message || `Unable to save ${title.toLowerCase()}.`;
      if (serverData) msg = serverData.message || JSON.stringify(serverData);
      setError(msg);
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

  /* ── clear all filters ────────────────────────────────────────────────── */
  const clearAllFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setMultiValues({});
    setStatusSelected([]);
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    Object.values(multiValues).filter((v) => v.length > 0).length +
    (statusSelected.length > 0 ? 1 : 0);

  /* ── filtered items ───────────────────────────────────────────────────── */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. text search across all visible column values
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const match = columns.some((col) => {
          const raw = col.render ? col.render(item) : getValue(item, col.key);
          return String(raw ?? '').toLowerCase().includes(q);
        });
        if (!match) return false;
      }

      // 2. date range (looks for any Date-ish field)
      if (dateFrom || dateTo) {
        const dateFilter = (filters || []).find((f) => f.type === 'daterange');
        const rawDate = dateFilter ? getFilterValue(item, dateFilter) : (item.attendanceDate || item.date || item.createdAt);
        const d = rawDate ? new Date(String(rawDate).slice(0, 10)) : null;
        if (d) {
          if (dateFrom && d < new Date(dateFrom)) return false;
          if (dateTo   && d > new Date(dateTo))   return false;
        }
      }

      // 3. multi-select filters
      for (const filter of multiFilters) {
        const selected = multiValues[filter.name] || [];
        if (selected.length === 0) continue;
        const itemVal = getFilterValue(item, filter);
        const id = getId(itemVal) || String(itemVal || '');
        if (!selected.includes(id)) return false;
      }

      // 4. status chip filter
      if (statusSelected.length > 0 && statusFilter) {
        const itemStatus = String(getFilterValue(item, statusFilter) || '');
        if (!statusSelected.includes(itemStatus)) return false;
      }

      return true;
    });
  }, [items, search, dateFrom, dateTo, multiValues, statusSelected, columns, filters, multiFilters, statusFilter]);

  /* ── render cell ──────────────────────────────────────────────────────── */
  const renderCell = (item, column) => {
    if (column.render) return column.render(item);
    const value = getValue(item, column.key);
    if (typeof value === 'boolean') {
      return <Badge bg={value ? 'success' : 'secondary'}>{value ? 'Active' : 'Inactive'}</Badge>;
    }
    // auto-badge for status-like string values
    if (typeof value === 'string' && STATUS_COLOURS[value]) {
      const s = STATUS_COLOURS[value];
      return (
        <span style={{
          padding: '3px 10px', borderRadius: 12,
          background: s.bg, color: s.color,
          border: `1px solid ${s.border}`,
          fontWeight: 600, fontSize: 12,
        }}>
          {value}
        </span>
      );
    }
    return value || 'N/A';
  };

  /* ── status options derived from actual data ─────────────────────────── */
  const statusOptions = useMemo(() => {
    if (!statusFilter) return [];
    const vals = [...new Set(items.map((item) => String(getFilterValue(item, statusFilter) || '')).filter(Boolean))];
    return vals;
  }, [items, statusFilter]);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="container-fluid mt-3">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{title}</h2>
        <Button variant="primary" onClick={openAdd}>
          <i className={`bi ${icon || 'bi-plus-lg'} me-2`}></i>Add
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      {hasAnyFilter && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,.05)',
        }}>
          {/* Row 1: search + date range */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
            {/* Text search */}
            {(searchFilter || hasAnyFilter) && (
              <div style={{ flex: '1 1 220px', minWidth: 180 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                  Search
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-search" style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    color: '#9ca3af', fontSize: 13, pointerEvents: 'none',
                  }}></i>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchFilter?.placeholder || 'Search records…'}
                    style={{
                      width: '100%', padding: '6px 12px 6px 30px',
                      border: '1px solid #ced4da', borderRadius: 6,
                      fontSize: 14, outline: 'none',
                      background: search ? '#f0f4ff' : '#fff',
                    }}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}>
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Date range */}
            {hasDateFilter && (
              <>
                <div style={{ flex: '0 1 160px', minWidth: 140 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13, background: dateFrom ? '#f0f4ff' : '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: '0 1 160px', minWidth: 140 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #ced4da', borderRadius: 6, fontSize: 13, background: dateTo ? '#f0f4ff' : '#fff', outline: 'none' }}
                  />
                </div>
              </>
            )}

            {/* Multi-select dropdowns */}
            {multiFilters.map((filter) => (
              <div key={filter.name} style={{ flex: '1 1 180px', minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>
                  {filter.label}
                </label>
                <MultiSelectDropdown
                  label={filter.label}
                  options={filter.optionsList || options[filter.options] || []}
                  selected={multiValues[filter.name] || []}
                  onChange={(vals) => setMultiValues((prev) => ({ ...prev, [filter.name]: vals }))}
                  labelPaths={relations[filter.options]?.labelPaths}
                />
              </div>
            ))}
          </div>

          {/* Row 2: status chip filters */}
          {statusFilter && statusOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                {statusFilter.label || 'Status'}:
              </span>
              {statusOptions.map((s) => (
                <StatusChip
                  key={s}
                  value={s}
                  selected={statusSelected.includes(s)}
                  onClick={() => setStatusSelected((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                  )}
                />
              ))}
              {statusSelected.length > 0 && (
                <button onClick={() => setStatusSelected([])} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer', padding: '2px 6px' }}>
                  ✕ Clear
                </button>
              )}
            </div>
          )}

          {/* Row 3: summary + clear all */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  Showing <strong style={{ color: '#1f2937' }}>{filteredItems.length}</strong> of <strong style={{ color: '#1f2937' }}>{items.length}</strong> records
                  {activeFilterCount > 0 && (
                    <span style={{ marginLeft: 6, background: '#4f46e5', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                    </span>
                  )}
                </>
              )}
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  background: 'none', border: '1px solid #fca5a5', borderRadius: 6,
                  color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <i className="bi bi-x-lg"></i> Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
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
                  <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                    {activeFilterCount > 0 ? (
                      <>
                        <i className="bi bi-funnel fs-4 d-block mb-2 text-secondary"></i>
                        No records match your filters.{' '}
                        <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>
                          Clear filters
                        </button>
                      </>
                    ) : (
                      'No records found.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* ── Add / Edit modal ────────────────────────────────────────────── */}
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
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CoreResourcePage;
