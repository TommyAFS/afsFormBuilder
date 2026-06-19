import LinkButton from '../../../../atoms/LinkButton'

import { RELATIONSHIP_OPTIONS } from '../../configVars'
import { serialiseDob } from '../../helpers/bookingFormSerialisers'
import { DateOfBirthValue } from '../../types'
import ContactAddress from '../../../../../types/ContactAddress'
import { getAddressLinesFrom } from '../../../../../utils/booking/getAddressLinesFrom'

import styles from './styles.module.scss'

type ECValues = {
  ecRelationship?: string
  ecFirstName?: string
  ecLastName?: string
  ecEmail?: string
  ecPhone?: string
}

type ECDobValues = {
  ecDob?: DateOfBirthValue
}

type GuarantorDetailsProps = {
  values: ECValues
  dobValues: ECDobValues
  address?: ContactAddress
  onEdit?: () => void
}

export const GuarantorDetails = ({
  values,
  dobValues,
  address,
  onEdit,
}: GuarantorDetailsProps) => {
  const relationship = RELATIONSHIP_OPTIONS.find(
    (option) => option.value === values.ecRelationship
  )?.label

  const dob = dobValues.ecDob ? serialiseDob(dobValues.ecDob) : undefined

  const addressLines = address ? getAddressLinesFrom(address) : []

  return (
    <div className={styles.wrapper}>
      <dl className={styles.guarantorDetails}>
        {relationship && (
          <>
            <dt className={styles.detailLabel}>Relationship</dt>
            <dd className={styles.detailValue}>{relationship}</dd>
          </>
        )}
        <dt className={styles.detailLabel}>Full name</dt>
        <dd className={styles.detailValue}>
          {[values.ecFirstName, values.ecLastName].filter(Boolean).join(' ')}
        </dd>
        {values.ecEmail && (
          <>
            <dt className={styles.detailLabel}>Email address</dt>
            <dd className={styles.detailValue}>{values.ecEmail}</dd>
          </>
        )}
        {values.ecPhone && (
          <>
            <dt className={styles.detailLabel}>Phone number</dt>
            <dd className={styles.detailValue}>{values.ecPhone}</dd>
          </>
        )}
        {dob && (
          <>
            <dt className={styles.detailLabel}>Date of birth</dt>
            <dd className={styles.detailValue}>{dob}</dd>
          </>
        )}
        {addressLines.length > 0 && (
          <>
            <dt className={styles.detailLabel}>Address</dt>
            <dd>
              <address className={styles.detailValue}>
                {addressLines.map((line, index) => (
                  <span key={index} className={styles.addressLine}>
                    {line}
                  </span>
                ))}
              </address>
            </dd>
          </>
        )}
      </dl>
      {onEdit && (
        <LinkButton className={styles.editLink} onClick={onEdit}>
          Edit details
        </LinkButton>
      )}
    </div>
  )
}
