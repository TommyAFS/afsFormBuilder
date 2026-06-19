const FieldDateOfBirth = ({ id, label, value, onChange, invalid }: any) => (
  <fieldset>
    <legend>{label}</legend>
    <input
      data-testid={`${id}-day`}
      aria-label={`${label} day`}
      value={value.day}
      onChange={(e) => onChange({ ...value, day: e.target.value })}
    />
    <input
      data-testid={`${id}-month`}
      aria-label={`${label} month`}
      value={value.month}
      onChange={(e) => onChange({ ...value, month: e.target.value })}
    />
    <input
      data-testid={`${id}-year`}
      aria-label={`${label} year`}
      value={value.year}
      onChange={(e) => onChange({ ...value, year: e.target.value })}
    />
    {invalid?.day && <span>{invalid.day}</span>}
    {invalid?.month && <span>{invalid.month}</span>}
    {invalid?.year && <span>{invalid.year}</span>}
  </fieldset>
)

export default FieldDateOfBirth
