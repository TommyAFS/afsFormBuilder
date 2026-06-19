import getMatchedAndNotMatchedSubstrings from './getMatchedAndNotMatchedSubstrings'

describe('getMatchedAndNotMatchedSubstrings', () => {
  it('should return the correct matched and not matched substrings when the search term match is at the beginning of the string', () => {
    const result = getMatchedAndNotMatchedSubstrings('Manchester', 'man')
    expect(result[0].matchedSubstring).toBe('Man')
    expect(result[0].notMatchedSubstringAtTheBeginning).toBe('')
    expect(result[1].notMatchedSubstringAtTheBeginning).toBe('chester')
  })

  it('should return the correct matched and not matched substrings when the search term match is at the middle of the string', () => {
    const result = getMatchedAndNotMatchedSubstrings('Manchester', 'chest')
    expect(result[0].notMatchedSubstringAtTheBeginning).toBe('Man')
    expect(result[1].matchedSubstring).toBe('chest')
    expect(result[2].notMatchedSubstringAtTheBeginning).toBe('er')
  })

  it('should return the correct matched and not matched substrings when the search term match is at the end of the string', () => {
    const result = getMatchedAndNotMatchedSubstrings('Manchester', 'ter')
    expect(result[0].notMatchedSubstringAtTheBeginning).toBe('Manches')
    expect(result[1].matchedSubstring).toBe('ter')
  })

  it('should return the correct matched and not matched substrings when the search term contains white space', () => {
    const result = getMatchedAndNotMatchedSubstrings(
      '12 Crabtree Lane',
      '12 Crabtree'
    )

    const extractedMatchedSubstrings = result.map((r) => r.matchedSubstring)
    const nonEmptyMatchedSubstrings = extractedMatchedSubstrings.filter(Boolean)

    expect(nonEmptyMatchedSubstrings).toEqual(['12', 'Crabtree'])
  })
})
