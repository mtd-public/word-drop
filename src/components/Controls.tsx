interface ControlsProps {
  orientation: 'row' | 'column'
  onLeft: () => void
  onRotate: () => void
  onRight: () => void
  disabled?: boolean
}

export function Controls({ orientation, onLeft, onRotate, onRight, disabled }: ControlsProps) {
  return (
    <div className={`controls controls--${orientation}`}>
      <button type="button" className="btn" onClick={onLeft} disabled={disabled} aria-label="Move left">
        ◀
      </button>
      <button type="button" className="btn btn--rotate" onClick={onRotate} disabled={disabled} aria-label="Rotate piece">
        ↻
      </button>
      <button type="button" className="btn" onClick={onRight} disabled={disabled} aria-label="Move right">
        ▶
      </button>
    </div>
  )
}
