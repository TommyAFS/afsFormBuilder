import ButtonNew from '@afs/components/ButtonNew'
import Heading from '@afs/components/Heading'
import { useOverlayContext } from '@afs/components/OverlayContext'
import OverlaySlideUp from '@afs/components/OverlaySlideUp'
import {
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
} from './configVars'
import { FieldConfig, SectionConfig } from './types'

import styles from './configStyles.module.scss'
import Link from '../../atoms/Link'

export type FieldId =
  // Personal details
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  // Additional details
  | 'dob'
  | 'gender'
  | 'country'
  | 'address'
  | 'yearOfStudy'
  | 'university'
  | 'courseName'
  // Emergency contact
  | 'ecRelationship'
  | 'ecFirstName'
  | 'ecLastName'
  | 'ecEmail'
  | 'ecPhone'
  | 'ecCountry'
  | 'ecDob'
  | 'ecAddress'
  // Guarantor
  | 'hasGuarantor'
  | 'guarantorSameAsEC'
  | 'guarantorRelationship'
  | 'guarantorFirstName'
  | 'guarantorLastName'
  | 'guarantorEmail'
  | 'guarantorPhone'
  | 'guarantorCountry'
  | 'guarantorDob'
  | 'guarantorAddress'

const guarantorDetailVisibility = (values: Record<string, string>) =>
  values.hasGuarantor === 'yes' && values.guarantorSameAsEC === 'no'

const capitalise = <Word extends string>(word: Word): Capitalize<Word> =>
  (word.charAt(0).toUpperCase() + word.slice(1)) as Capitalize<Word>

// Emergency contact and guarantor collect the same set of contact details,
// differing only by field-id prefix, the address label, and (for the
// guarantor) the visibility rule. Generate both from one definition.
const contactFields = (
  prefix: 'ec' | 'guarantor',
  addressLabel: string,
  visibleWhen?: (values: Record<string, string>) => boolean
): FieldConfig[] => {
  const fieldId = <Name extends string>(
    name: Name
  ): `${'ec' | 'guarantor'}${Capitalize<Name>}` =>
    `${prefix}${capitalise(name)}`

  const fields = [
    {
      id: fieldId('relationship'),
      label: 'Relationship to you',
      type: 'select',
      options: RELATIONSHIP_OPTIONS,
      validation: { required: 'Please select relationship' },
    },
    {
      id: fieldId('firstName'),
      label: 'First name',
      type: 'text',
      validation: { required: 'Please enter first name' },
    },
    {
      id: fieldId('lastName'),
      label: 'Last name',
      type: 'text',
      validation: { required: 'Please enter last name' },
    },
    {
      id: fieldId('email'),
      label: 'Email address',
      type: 'email',
      validation: { required: 'Please enter email address' },
    },
    {
      id: fieldId('phone'),
      label: 'Phone number',
      type: 'tel',
      validation: { required: 'Please enter phone number' },
    },
    {
      id: fieldId('dob'),
      label: 'Date of birth',
      type: 'dob',
    },
    {
      id: fieldId('address'),
      label: addressLabel,
      type: 'address',
      validation: { required: 'Search address or enter address manually' },
    },
  ] satisfies FieldConfig[]

  return visibleWhen
    ? fields.map((field) => ({ ...field, visibleWhen }))
    : fields
}

export const formConfig = [
  {
    id: 'personal' as const,
    label: 'Personal details',
    fields: [
      {
        id: 'firstName',
        label: 'First name',
        type: 'text',
        autoComplete: 'given-name',
        validation: { required: 'Please enter first name' },
      },
      {
        id: 'lastName',
        label: 'Last name',
        type: 'text',
        autoComplete: 'family-name',
        validation: { required: 'Please enter last name' },
      },
      {
        id: 'email',
        label: 'Email address',
        type: 'email',
        autoComplete: 'email',
        validation: { required: 'Please enter email address' },
      },
      {
        id: 'phone',
        label: 'Phone number',
        type: 'tel',
        autoComplete: 'tel',
        validation: {
          required: 'Please enter phone number',
        },
      },
    ],
  },
  {
    id: 'additional' as const,
    label: 'Additional details',
    fields: [
      {
        id: 'dob',
        label: 'Date of birth',
        type: 'dob',
      },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        options: GENDER_OPTIONS,
        validation: { required: 'Please select gender' },
      },
      {
        id: 'country',
        label: 'Country of citizenship',
        type: 'country',
        validation: { required: 'Please select a country of citizenship' },
      },
      {
        id: 'address',
        label: 'Your address',
        type: 'address',
        validation: { required: 'Search address or enter address manually' },
      },
      {
        id: 'yearOfStudy',
        label: 'Year of study',
        type: 'select',
        options: YEAR_OF_STUDY_OPTIONS,
        validation: { required: 'Please select year of study' },
      },
      {
        id: 'university',
        label: 'University',
        type: 'text',
        validation: { required: 'Please enter university' },
      },
      {
        id: 'courseName',
        label: 'Course title',
        type: 'text',
        validation: { required: 'Please enter course title' },
      },
    ],
  },
  {
    id: 'emergency' as const,
    label: 'Emergency contact',
    fields: contactFields('ec', "Emergency contact's address"),
  },
  {
    id: 'guarantor' as const,
    label: 'Guarantor',
    subTitle: {
      uk: {
        content:
          'A guarantor is someone who agrees to cover rent payments if needed. ',
        overlayContent: (
          <OverlaySlideUp
            headerClassName={styles.overlayHeader}
            mainContentClassName={styles.overlayContent}
            footerClassName={styles.overlayFooter}
            overlayUniqueId="guarantor-uk"
            useOverlayContext={useOverlayContext}
            renderButton={(open) => (
              <ButtonNew
                type="button"
                onClick={open}
                styleAsLink={{ variant: 'grey' }}
              >
                Learn more
              </ButtonNew>
            )}
            showFooterCloseButtonOnMobileAndDesktop={true}
            footerCloseButtonText="Continue"
          >
            <Heading className={styles.mainHeading} level={2}>
              About guarantors
            </Heading>
            <p className={styles.copy}>
              A guarantor is someone who agrees to take responsibility for your
              tenancy if you&apos;re unable to, such as paying your rent.
            </p>

            <Heading className={styles.heading} level={3}>
              Who can be your guarantor?
            </Heading>
            <p className={styles.copyListIntro}>
              For this accommodation, your guarantor must:
            </p>
            <ul className={styles.checklist}>
              <li className={styles.checklistItem}>Live in the UK</li>
              <li className={styles.checklistItem}>
                Be willing to act as your guarantor
              </li>
              <li className={styles.checklistItem}>
                Pass any required affordability or credit checks
              </li>
            </ul>
            <p className={styles.copy}>
              Most students choose a parent, guardian or family member.
            </p>

            <Heading className={styles.heading} level={3}>
              Can&apos;t provide a UK-based guarantor?
            </Heading>
            <p className={styles.copy}>
              You may be able to pay all of your rent in advance, or use{' '}
              <Link to="/partners/housinghand" variant="grey" target="_blank">
                Housing Hand
              </Link>{' '}
              as a guarantor service.
            </p>
          </OverlaySlideUp>
        ),
      },
      international: {
        content:
          'A guarantor is someone who agrees to cover rent payments if needed. ',
        overlayContent: (
          <OverlaySlideUp
            headerClassName={styles.overlayHeader}
            mainContentClassName={styles.overlayContent}
            footerClassName={styles.overlayFooter}
            overlayUniqueId="guarantor-international"
            useOverlayContext={useOverlayContext}
            renderButton={(open) => (
              <ButtonNew
                type="button"
                onClick={open}
                styleAsLink={{ variant: 'grey' }}
              >
                Learn more
              </ButtonNew>
            )}
            showFooterCloseButtonOnMobileAndDesktop={true}
            footerCloseButtonText="Continue"
          >
            <Heading className={styles.mainHeading} level={2}>
              About guarantors
            </Heading>
            <p className={styles.copy}>
              A guarantor is someone who agrees to take responsibility for your
              tenancy if you&apos;re unable to, such as paying your rent.
            </p>

            <Heading className={styles.heading} level={3}>
              Who can be your guarantor?
            </Heading>
            <p className={styles.copyList}>
              For this accommodation, your guarantor{' '}
              <span className={styles.bold}>
                can live inside or outside the UK.
              </span>
            </p>
            <p className={styles.copyListIntro}>They must:</p>
            <ul className={styles.checklist}>
              <li className={styles.checklistItem}>
                Be willing to act as your guarantor
              </li>
              <li className={styles.checklistItem}>
                Pass any required affordability or credit checks
              </li>
            </ul>
            <p className={styles.copy}>
              Most students choose a parent, guardian or family member.
            </p>

            <Heading className={styles.heading} level={3}>
              Can&apos;t provide a guarantor?
            </Heading>
            <p className={styles.copy}>
              You may be able to pay all of your rent in advance, or use{' '}
              <Link to="/partners/housinghand" variant="grey" target="_blank">
                Housing Hand
              </Link>{' '}
              as a guarantor service.
            </p>
          </OverlaySlideUp>
        ),
      },
    },
    fields: [
      {
        id: 'hasGuarantor',
        label: {
          uk: 'Do you have a UK-based guarantor?',
          international: 'Do you have an international guarantor?',
        },
        subTitle: `If not, select "No" and we'll help you find one.`,
        type: 'radio',
        options: [
          { value: 'yes', label: 'Yes, I have one' },
          { value: 'no', label: 'No, I need a guarantor' },
        ],
        validation: { required: 'Please select an option' },
      },
      {
        id: 'guarantorSameAsEC',
        label: 'Is your guarantor the same as your emergency contact?',
        type: 'radio',
        inline: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        validation: { required: 'Please select an option' },
        visibleWhen: (values) => values.hasGuarantor === 'yes',
      },
      ...contactFields(
        'guarantor',
        "Guarantor's address",
        guarantorDetailVisibility
      ),
    ],
  },
] satisfies SectionConfig[]

export type SectionId = (typeof formConfig)[number]['id']
