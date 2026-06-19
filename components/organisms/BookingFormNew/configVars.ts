import Gender from '../../../types/Gender'
import YearOfStudy from '../../../types/YearOfStudy'
import ContactRelationship from '../../../types/ContactRelationship'

export const RELATIONSHIP_OPTIONS: {
  value: ContactRelationship
  label: string
}[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'partner', label: 'Partner' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'familyMember', label: 'Family member' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
]

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'nonBinary', label: 'Non-binary' },
  { value: 'preferNotToSay', label: 'Prefer not to say' },
]

export const YEAR_OF_STUDY_OPTIONS: { value: YearOfStudy; label: string }[] = [
  { value: 'foundation', label: 'Foundation' },
  { value: 'firstYear', label: 'Undergraduate - First year' },
  { value: 'secondYear', label: 'Undergraduate - Second year' },
  { value: 'thirdYear', label: 'Undergraduate - Third year' },
  { value: 'placementYear', label: 'Undergraduate - Placement year' },
  { value: 'masters', label: 'Postgraduate - Masters' },
  { value: 'phd', label: 'Postgraduate - PhD' },
]
