// Pure functions for request matching

/**
 * Converts a path pattern to a regular expression
 * @param pattern - The pattern with potential :params and wildcards
 * @returns RegExp that matches the pattern
 */
const patternToRegex = (pattern: string): RegExp => {
  // First, replace wildcards with a placeholder to protect them from escaping
  const withWildcardPlaceholder = pattern.replace(/\*/g, '__WILDCARD__')

  // Escape special regex characters except for :param
  const escaped = withWildcardPlaceholder.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

  // Replace :param with named capture group that matches any non-slash characters
  const withParams = escaped.replace(/:(\w+)/g, '(?<$1>[^/]+)')

  // Replace wildcard placeholder
  // Check if wildcard is at the end - if so, match everything
  // Otherwise, match only non-slash characters (single path segment)
  const withWildcards = withParams.replace(/__WILDCARD__/g, (match, offset, string) => {
    // If wildcard is at the end, match everything including slashes
    if (offset + match.length >= string.length || string[offset + match.length] === '$') {
      return '.*'
    }
    // Otherwise, match only within a single path segment
    return '[^/]+'
  })

  return new RegExp(`^${withWildcards}$`)
}

/**
 * Matches a path against a pattern
 * @param pattern - The pattern to match against (e.g., '/users', '/users/:id', '/api/*')
 * @param path - The actual request path
 * @returns true if the path matches the pattern
 */
export const matchPath = (pattern: string, path: string): boolean => {
  // Quick check for exact match (optimization)
  if (pattern === path) {
    return true
  }

  // Check if pattern has parameters or wildcards
  if (pattern.includes(':') || pattern.includes('*')) {
    const regex = patternToRegex(pattern)
    return regex.test(path)
  }

  return false
}

/**
 * Extracts path parameters from a path based on a pattern
 * @param pattern - The pattern with :param placeholders
 * @param path - The actual request path
 * @returns Record of parameter names to values
 */
export const parsePathParams = (pattern: string, path: string): Record<string, string> => {
  // If no parameters in pattern, return empty object
  if (!pattern.includes(':')) {
    return {}
  }

  const regex = patternToRegex(pattern)
  const match = path.match(regex)

  if (!match || !match.groups) {
    return {}
  }

  return match.groups
}
