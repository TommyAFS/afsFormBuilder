import Field from '@afs/components/Field'
import styles from './Date.module.css'
import type { DateErrors } from './date.validation'

type DateOfBirthValue = {
  day: string
  month: string
  year: string
}

type FieldDateOfBirthProps = {
  id: string
  label?: string
  value: DateOfBirthValue
  onChange: (value: DateOfBirthValue) => void
  onBlur?: () => void
  invalid?: DateErrors
  className?: string
  required?: boolean
}

export default function FieldDateOfBirth({
  id,
  label,
  value,
  onChange,
  onBlur,
  invalid,
  className,
  required,
}: FieldDateOfBirthProps) {
  return (
    <div className={className}>
      {label && <p className={styles.fieldLabel}>{label}</p>}
      <div className={styles.inputs}>
        <Field
          key={`${id}-day`}
          id={`${id}-day`}
          name={`${id}-day`}
          label="Day"
          value={value.day}
          onChange={(e) => onChange({ ...value, day: e.target.value })}
          onBlur={onBlur}
          autoComplete="bday-day"
          inputMode="numeric"
          pattern="[0-9]*"
          required={required}
          invalid={invalid?.day !== undefined}
          size="small"
          placeholder={'DD'}
        />
        <Field
          key={`${id}-month`}
          id={`${id}-month`}
          name={`${id}-month`}
          label="Month"
          value={value.month}
          onChange={(e) => onChange({ ...value, month: e.target.value })}
          onBlur={onBlur}
          autoComplete="bday-month"
          inputMode="numeric"
          pattern="[0-9]*"
          required={required}
          invalid={invalid?.month !== undefined}
          size="small"
          placeholder={'MM'}
        />
        <Field
          key={`${id}-year`}
          id={`${id}-year`}
          name={`${id}-year`}
          label="Year"
          value={value.year}
          onChange={(e) => onChange({ ...value, year: e.target.value })}
          onBlur={onBlur}
          autoComplete="bday-year"
          inputMode="numeric"
          pattern="[0-9]*"
          required={required}
          invalid={invalid?.year !== undefined}
          size="small"
          placeholder={'YYYY'}
        />
      </div>
      {invalid?.day && <p className={styles.error}>{invalid.day}</p>}
      {invalid?.month && <p className={styles.error}>{invalid.month}</p>}
      {invalid?.year && <p className={styles.error}>{invalid.year}</p>}
    </div>
  )
}
