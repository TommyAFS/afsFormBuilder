interface MatchResult {
  matchedSubstring: string
  notMatchedSubstringAtTheBeginning: string
}

const getMatchedAndNotMatchedSubstrings = (
  text: string,
  searchTerm: string
): MatchResult[] => {
  const terms = searchTerm.split(/\s+/).filter(Boolean)
  const results: MatchResult[] = []

  const matchedCharacterIndices = new Array(text.length).fill(false)

  for (const term of terms) {
    let matchIndex = -1
    do {
      matchIndex = text
        .toLowerCase()
        .indexOf(term.toLowerCase(), matchIndex + 1)

      if (matchIndex !== -1) {
        for (let offset = 0; offset < term.length; offset++) {
          matchedCharacterIndices[matchIndex + offset] = true
        }
      }
    } while (matchIndex !== -1)
  }

  let currentMatched = ''
  let currentNotMatched = ''

  for (let index = 0; index < text.length; index++) {
    const isMatched = matchedCharacterIndices[index]

    if (isMatched && currentNotMatched) {
      results.push({
        matchedSubstring: '',
        notMatchedSubstringAtTheBeginning: currentNotMatched,
      })
      currentNotMatched = ''
    }

    if (!isMatched && currentMatched) {
      results.push({
        matchedSubstring: currentMatched,
        notMatchedSubstringAtTheBeginning: '',
      })
      currentMatched = ''
    }

    if (isMatched) {
      currentMatched += text[index]
    } else {
      currentNotMatched += text[index]
    }
  }

  if (currentMatched) {
    results.push({
      matchedSubstring: currentMatched,
      notMatchedSubstringAtTheBeginning: '',
    })
  }

  if (currentNotMatched) {
    results.push({
      matchedSubstring: '',
      notMatchedSubstringAtTheBeginning: currentNotMatched,
    })
  }

  return results
}

export default getMatchedAndNotMatchedSubstrings
