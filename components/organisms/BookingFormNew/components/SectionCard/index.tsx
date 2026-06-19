import classNames from 'classnames'
import ButtonNew from '@afs/components/ButtonNew'

import { ActiveSection } from '../ActiveSection'
import { ActiveSectionProps } from '../../types'

import styles from '../../styles.module.scss'

export type SectionCardProps = ActiveSectionProps & {
  index: number
  isActive: boolean
  isCompleted: boolean
  isUntouched: boolean
  summaryValues: Record<string, string>
  registerRef: (element: HTMLDivElement | null) => void
}

export const SectionCard = ({
  index,
  isActive,
  isCompleted,
  isUntouched,
  summaryValues,
  registerRef,
  ...activeSectionProps
}: SectionCardProps) => {
  const { section, onEdit } = activeSectionProps

  return (
    <div
      ref={registerRef}
      className={classNames(styles.card, {
        [styles.cardCompleted]: isCompleted,
        [styles.cardUntouched]: isUntouched,
      })}
    >
      <fieldset
        disabled={!isCompleted && !isActive}
        className={styles.fieldset}
      >
        <legend className={styles.legend}>
          <span className={styles.legendTitle}>{section.label}</span>
          {isCompleted && (
            <ButtonNew
              className={styles.editButton}
              type="button"
              onClick={() => onEdit(index)}
              variant="text-filled"
            >
              Edit
            </ButtonNew>
          )}
        </legend>
        {isCompleted && (
          <p className={styles.summary}>
            {section
              .summarise(summaryValues)
              .slice(0, 3)
              .map((item, summaryIndex) => (
                <span
                  key={`${section.id}-${summaryIndex}`}
                  className={styles.summaryItem}
                >
                  {item}
                </span>
              ))}
          </p>
        )}

        {isActive && <ActiveSection {...activeSectionProps} />}
      </fieldset>
    </div>
  )
}
