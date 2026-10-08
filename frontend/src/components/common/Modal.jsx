import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : size === 'sm' ? 'modal-sm' : '';

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header border-bottom py-3 px-4 bg-light bg-opacity-50">
            <h5 className="modal-title fs-6 fw-bold text-dark">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">{children}</div>
          {footer && <div className="modal-footer border-top py-2 px-4 bg-light bg-opacity-25">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
