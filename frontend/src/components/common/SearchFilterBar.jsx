import React from 'react';

export const SearchFilterBar = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filterOptions = [],
  filterValue,
  onFilterChange,
  filterLabel = 'All Statuses',
  extraFilters = null,
  onAddNew,
  addButtonLabel = 'Add New',
  canAdd = true
}) => {
  return (
    <div className="row g-2 align-items-center mb-3">
      {/* Search Input */}
      <div className="col-12 col-md-4 col-lg-4">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control form-control-custom border-start-0"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              className="btn btn-outline-secondary border-start-0 border"
              type="button"
              onClick={() => onSearchChange('')}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      {/* Primary Filter */}
      {filterOptions.length > 0 && (
        <div className="col-6 col-md-3 col-lg-2">
          <select
            className="form-select form-select-sm form-select-custom"
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="">{filterLabel}</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Extra Filters Slot */}
      {extraFilters && <div className="col-6 col-md-3 col-lg-3 d-flex gap-2">{extraFilters}</div>}

      {/* Action Button */}
      {canAdd && onAddNew && (
        <div className="col-12 col-md-auto ms-auto text-end">
          <button
            onClick={onAddNew}
            className="btn btn-sm btn-primary-custom d-inline-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-plus-lg"></i>
            <span>{addButtonLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
