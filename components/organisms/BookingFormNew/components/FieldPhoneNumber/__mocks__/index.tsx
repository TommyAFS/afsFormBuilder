const FieldPhoneNumber = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  required,
  error,
}: any) => (
  <div>
    <label htmlFor={id || name}>{label}</label>
    <input
      id={id || name}
      name={name}
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      required={required}
    />
    {error && <span>{error}</span>}
  </div>
)

export default FieldPhoneNumber
