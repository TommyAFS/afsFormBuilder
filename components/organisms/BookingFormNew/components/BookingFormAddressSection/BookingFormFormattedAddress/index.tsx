import classNames from 'classnames'

import LinkButton from '../../../../../atoms/LinkButton'
import Button from '../../../../../atoms/Button'
import FormattedAddress from '../../../../../atoms/FormattedContactAddress'

import ContactAddress from '../../../../../../types/ContactAddress'

import SearchIcon from '../../../../../../svgs/icons/search-icon.svg'

import styles from './styles.module.scss'
import ButtonNew from '@afs/components/ButtonNew'

export interface BookingFormFormattedAddressProps {
  className?: string
  address: ContactAddress
  showManualAddressEntryFields: () => void
  onSearchForDifferentAddressButtonClick: () => void
}

const BookingFormFormattedAddress = ({
  className,
  address,
  showManualAddressEntryFields,
  onSearchForDifferentAddressButtonClick,
}: BookingFormFormattedAddressProps) => {
  return (
    <div
      className={classNames(styles.addressWrapper, className)}
      data-testid="formatted-address"
    >
      <FormattedAddress className={styles.address} address={address} />

      <ButtonNew
        className={styles.manualAddressLinkButton}
        type="button"
        onClick={showManualAddressEntryFields}
        styleAsLink={{
          variant: 'grey',
        }}
      >
        Edit address manually
      </ButtonNew>

      <ButtonNew
        className={styles.addressSearchButton}
        variant="primary-dark"
        size="s"
        type="button"
        onClick={onSearchForDifferentAddressButtonClick}
      >
        <SearchIcon className={styles.buttonIcon} />
        Search different address
      </ButtonNew>
    </div>
  )
}

export default BookingFormFormattedAddress
