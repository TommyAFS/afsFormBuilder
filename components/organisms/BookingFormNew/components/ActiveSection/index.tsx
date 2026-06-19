import ButtonNew from '@afs/components/ButtonNew'

import { ActiveSectionProps } from '../../types'
import { SectionDefinition, sections } from '../../sectionBuilder'
import { renderField } from './fieldRenderer'
import { GuarantorDetails } from '../Guarantor/GuarantorDetails'

import styles from '../../styles.module.scss'
import { NoGuarantorText } from '../Guarantor/NoGuarantorText'

const emergencyContactSectionIndex = sections().findIndex(
  (section) => section.id === 'emergency'
)

type SubTitleProps = NonNullable<SectionDefinition['subTitle']>

function SubTitle({ content, overlayContent }: SubTitleProps) {
  return (
    <p className={styles.stepSubTitle}>
      {content}
      {overlayContent}
    </p>
  )
}

export const ActiveSection = (props: ActiveSectionProps) => {
  const {
    section,
    isEditing,
    sectionLoading,
    onContinue,
    onEdit,
    values,
    dobValues,
    addressValues,
  } = props

  const showGuarantorECSummary =
    section.id === 'guarantor' &&
    values.hasGuarantor === 'yes' &&
    values.guarantorSameAsEC === 'yes'

  const showNoGuarantorHelperText =
    section.id === 'guarantor' && values.hasGuarantor === 'no'

  let continueButtonLabel = isEditing ? 'Save' : 'Continue'
  if (sectionLoading) continueButtonLabel = 'Saving...'

  return (
    <div className={styles.fields}>
      {section.subTitle && <SubTitle {...section.subTitle} />}
      {section.fields.map((field) => renderField(field, props))}

      {showGuarantorECSummary && (
        <GuarantorDetails
          values={values}
          dobValues={dobValues}
          address={addressValues.ecAddress}
          onEdit={() => onEdit(emergencyContactSectionIndex)}
        />
      )}

      {showNoGuarantorHelperText && <NoGuarantorText />}

      <ButtonNew
        type="button"
        disabled={sectionLoading}
        onClick={onContinue}
        variant="primary-default"
        className={styles.stepButton}
        size="s"
      >
        {continueButtonLabel}
      </ButtonNew>
    </div>
  )
}
