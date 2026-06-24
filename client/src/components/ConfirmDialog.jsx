export default function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="dialog-card">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="dialog-actions">
          <button className="secondary" type="button" onClick={onCancel}>{cancelLabel || 'Cancel'}</button>
          <button type="button" onClick={onConfirm}>{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}
