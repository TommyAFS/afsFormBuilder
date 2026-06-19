import getMatchedAndNotMatchedSubstrings from '../getMatchedAndNotMatchedSubstrings'
import LabelType from '../../../../../../types/Label'

import styles from '../styles.module.scss'

interface Substring {
  matchedSubstring: string
  notMatchedSubstringAtTheBeginning: string
}

const renderSubstrings = (substrings: Substring[]) =>
  substrings.map((substr, index) => (
    <span
      key={`${substr.matchedSubstring}-${substr.notMatchedSubstringAtTheBeginning}-${index}`}
    >
      {substr.notMatchedSubstringAtTheBeginning}

      {substr.matchedSubstring && (
        <span className={styles.suggestedItemMatchedText}>
          {substr.matchedSubstring}
        </span>
      )}
    </span>
  ))

interface SuggestedItemProps {
  label: LabelType
  searchTerm: string
}

const SuggestedItem = ({ label, searchTerm }: SuggestedItemProps) => {
  const mainSubstrings = getMatchedAndNotMatchedSubstrings(
    label.mainText,
    searchTerm
  )
  const secondarySubstrings = getMatchedAndNotMatchedSubstrings(
    label.secondaryText,
    searchTerm
  )

  return (
    <span className={styles.suggestedItemText}>
      <span className={styles.suggestedItemMainText}>
        {renderSubstrings(mainSubstrings)}
      </span>{' '}
      <span className={styles.suggestedItemSecondaryText}>
        {renderSubstrings(secondarySubstrings)}
      </span>
    </span>
  )
}

export default SuggestedItem
