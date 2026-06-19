import classNames from 'classnames'
import LinkButton from '../../../../../atoms/LinkButton'

import SuggestedItem from '../components/SuggestedItem'
import Suggestion from '../../../../../../types/Suggestion'
import GoogleLogo from '../svgs/google-logo.svg'

import styles from '../styles.module.scss'

interface DropdownFooterProps {
  onManualAddressEntryButtonClick: () => void
  cantFindAddressButtonRef: { current: HTMLButtonElement | null }
}

const DropdownFooter = ({
  onManualAddressEntryButtonClick,
  cantFindAddressButtonRef,
}: DropdownFooterProps) => (
  <>
    <GoogleLogo className={styles.googleLogo} />
    <LinkButton
      ref={cantFindAddressButtonRef}
      className={styles.dropdownLinkButton}
      type="button"
      onClick={onManualAddressEntryButtonClick}
    >
      Can't find your address? <span>Enter it manually</span>
    </LinkButton>
  </>
)

interface DropdownContentProps {
  showError: boolean
  showEmpty: boolean
  noMatches: boolean
  searchTerm: string
  options: Suggestion[]
  highlightedIndex: number
  getItemProps: (opts: { item: Suggestion; index: number }) => object
  onManualAddressEntryButtonClick: () => void
  cantFindAddressButtonRef: { current: HTMLButtonElement | null }
}

const DropdownContent = ({
  showError,
  showEmpty,
  noMatches,
  searchTerm,
  options,
  highlightedIndex,
  getItemProps,
  onManualAddressEntryButtonClick,
  cantFindAddressButtonRef,
}: DropdownContentProps) => {
  const footerProps = {
    onManualAddressEntryButtonClick,
    cantFindAddressButtonRef,
  }

  if (showError)
    return (
      <>
        <div className={styles.errorItem} data-testid="error-text">
          <span className={styles.errorHeading}>Oops! Something broke...</span>
          <span className={styles.errorText}>
            We couldn’t retrieve any addresses.
          </span>
          <span className={styles.errorText}>Please try again later.</span>
        </div>
        <DropdownFooter {...footerProps} />
      </>
    )

  if (showEmpty)
    return (
      <>
        <div className={styles.emptyItem} data-testid="empty-search-text">
          <span className={styles.emptyItemText}>
            Keep typing to show more results below
          </span>
        </div>
        <GoogleLogo className={styles.googleLogo} />
      </>
    )

  if (noMatches)
    return (
      <>
        <div className={styles.noMatchesItem} data-testid="no-matches-found">
          <span className={styles.noMatchesHeading}>No matches found</span>
          <span className={styles.noMatchesText}>
            {`We can't find any matches for '${searchTerm}'.`}
          </span>
          <span className={styles.noMatchesText}>
            Maybe try a less specific address?
          </span>
        </div>
        <DropdownFooter {...footerProps} />
      </>
    )

  if (options.length > 0)
    return (
      <>
        <ul className={styles.list} data-testid="address-autocomplete-options">
          {options.map((item, index) => (
            <li
              data-testid={`autocomplete-option-${index}`}
              className={classNames(styles.item, {
                [styles.itemHighlighted]: highlightedIndex === index,
              })}
              key={item.placeId}
              {...getItemProps({ index, item })}
            >
              <span className={styles.listItemText}>
                <SuggestedItem label={item.label} searchTerm={searchTerm} />
              </span>
            </li>
          ))}
        </ul>
        <DropdownFooter {...footerProps} />
      </>
    )

  return null
}

export default DropdownContent
