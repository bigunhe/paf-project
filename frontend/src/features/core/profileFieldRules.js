/** Campus profile rules — aligned with backend ProfileFieldValidator. */

export const DEPARTMENT_FACULTIES = ['Computing', 'Business', 'Engineering']
export const STUDENT_FACULTIES = DEPARTMENT_FACULTIES

export const FACULTY_TO_PREFIX = {
  Computing: 'IT',
  Business: 'BM',
  Engineering: 'EN',
}

export const PREFIX_TO_FACULTY = {
  IT: 'Computing',
  BM: 'Business',
  EN: 'Engineering',
}

export function normalizeUniversityId(raw) {
  return (raw ?? '').trim().toUpperCase()
}

export function sanitizeDigitSegment(raw, maxLen) {
  return (raw ?? '').replace(/\D/g, '').slice(0, maxLen)
}

export function composeStudentId(faculty, eightDigits) {
  const p = FACULTY_TO_PREFIX[faculty]
  if (!p || !eightDigits) return ''
  return p + sanitizeDigitSegment(eightDigits, 8)
}

export function composeLecturerId(sixDigits) {
  return 'LEC' + sanitizeDigitSegment(sixDigits, 6)
}

export function composeStaffId(sixDigits) {
  return 'STF' + sanitizeDigitSegment(sixDigits, 6)
}

/** Last 8 digits for student ID when faculty is known and id matches prefix. */
export function studentDigitsFromSavedId(fullId, faculty) {
  const u = normalizeUniversityId(fullId)
  const p = FACULTY_TO_PREFIX[faculty]
  if (p && u.startsWith(p)) return sanitizeDigitSegment(u.slice(2), 8)
  const pre = u.slice(0, 2)
  const inferred = PREFIX_TO_FACULTY[pre]
  if (inferred) return sanitizeDigitSegment(u.slice(2), 8)
  return ''
}

export function inferFacultyFromStudentId(fullId) {
  const u = normalizeUniversityId(fullId)
  return PREFIX_TO_FACULTY[u.slice(0, 2)] || ''
}

/** Six-digit segment only when the stored ID is already `LEC######`. Never infer from other formats. */
export function digitsFromLecturerId(fullId) {
  const u = normalizeUniversityId(fullId)
  if (!/^LEC\d{6}$/.test(u)) return ''
  return u.slice(3)
}

/** Six-digit segment only when the stored ID is already `STF######`. */
export function digitsFromStaffId(fullId) {
  const u = normalizeUniversityId(fullId)
  if (!/^STF\d{6}$/.test(u)) return ''
  return u.slice(3)
}

export function isLecturerIdFormat(id) {
  return /^LEC\d{6}$/.test(normalizeUniversityId(id))
}

export function isStaffIdFormat(id) {
  return /^STF\d{6}$/.test(normalizeUniversityId(id))
}

/** @returns {string|null} */
export function validateProfileFields(userType, academicUnitTrimmed, universityIdNormalized) {
  if (!userType || userType === 'UNASSIGNED') {
    return 'Complete your profile before continuing.'
  }
  const academic = (academicUnitTrimmed ?? '').trim()
  const id = normalizeUniversityId(universityIdNormalized)

  if (userType === 'STUDENT') {
    if (!DEPARTMENT_FACULTIES.includes(academic)) {
      return 'Choose Computing, Business, or Engineering.'
    }
    const prefix = FACULTY_TO_PREFIX[academic]
    if (!id.match(new RegExp(`^${prefix}\\d{8}$`))) {
      return 'Student number does not match the selected faculty.'
    }
    return null
  }

  if (userType === 'LECTURER') {
    if (!DEPARTMENT_FACULTIES.includes(academic)) {
      return 'Choose Computing, Business, or Engineering.'
    }
    if (!/^LEC\d{6}$/.test(id)) {
      return 'Lecturer ID format is invalid.'
    }
    return null
  }

  if (userType === 'STAFF') {
    if (!DEPARTMENT_FACULTIES.includes(academic)) {
      return 'Choose Computing, Business, or Engineering.'
    }
    if (!/^STF\d{6}$/.test(id)) {
      return 'Staff ID format is invalid.'
    }
    return null
  }

  return 'Invalid user type.'
}

// --- Inline (live) validation: short copy, shown when `show` is true ---

export function liveDepartmentError(faculty, visible) {
  if (!visible) return null
  if (!faculty) return 'Required.'
  if (!DEPARTMENT_FACULTIES.includes(faculty)) return 'Select a valid option.'
  return null
}

/**
 * @param {string} eightDigits
 * @param {string} faculty
 * @param {boolean} visible — user typed in this field or submit was attempted
 * @param {boolean} blurredField — field lost focus (shows required when empty)
 */
export function liveStudentEightDigitsError(eightDigits, faculty, visible, blurredField) {
  if (!visible && !blurredField) return null
  if (!faculty && eightDigits.length > 0) return 'Select your faculty before entering this number.'
  if (!faculty) return null
  if (!/^\d*$/.test(eightDigits)) return 'Digits only.'
  if (eightDigits.length === 0) return blurredField ? 'Required.' : null
  if (eightDigits.length < 8) return 'Enter 8 digits after the prefix.'
  if (!/^\d{8}$/.test(eightDigits)) return 'Digits only.'
  return null
}

export function liveEmpSixDigitsError(sixDigits, visible, blurredField) {
  if (!visible && !blurredField) return null
  if (!/^\d*$/.test(sixDigits)) return 'Digits only.'
  if (sixDigits.length === 0) return blurredField ? 'Required.' : null
  if (sixDigits.length < 6) return 'Enter 6 digits.'
  if (!/^\d{6}$/.test(sixDigits)) return 'Digits only.'
  return null
}

export function liveContactTenDigitsError(digits, visible, blurredField) {
  if (!visible && !blurredField) return null
  if (!/^\d*$/.test(digits)) return 'Digits only.'
  if (digits.length === 0) return blurredField ? 'Required.' : null
  if (digits.length !== 10) return 'Enter a 10-digit number.'
  return null
}

export function liveNameError(name, blurredOrSubmit) {
  if (!blurredOrSubmit) return null
  if (!name || !name.trim()) return 'Required.'
  return null
}
