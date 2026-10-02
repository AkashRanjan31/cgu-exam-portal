// University Email Restriction and Input Validations

export const CGU_DOMAIN = '@cgu-odisha.ac.in';
export const CGU_DOMAIN_ALT = '@cgu-odisha.in';

/**
 * Validates if the given email strictly ends with an authorised CVRGU domain.
 * Rejects @gmail.com, @yahoo.com, subdomain spoofing like @cgu-odisha.ac.in.evil.com.
 */
export const isValidUniversityEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+)$/;
  const match = trimmed.match(emailPattern);
  if (!match) return false;
  const domain = match[1];
  return (
    (trimmed.endsWith(CGU_DOMAIN) && domain === 'cgu-odisha.ac.in') ||
    (trimmed.endsWith(CGU_DOMAIN_ALT) && domain === 'cgu-odisha.in')
  );
};

export const isCguEmail = isValidUniversityEmail;

export const CGU_EMAIL_RESTRICTION_MESSAGE =
  'Only official @cgu-odisha.ac.in email addresses are allowed to access the CVRGU Online Examination System.';

/**
 * Validates registration form inputs.
 * Password strength: min 8 chars, at least one uppercase, one digit, one special char.
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Please enter your full legal student name (min. 2 characters).';
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'University email address is required.';
  } else if (!isCguEmail(formData.email)) {
    errors.email = CGU_EMAIL_RESTRICTION_MESSAGE;
  }

  if (!formData.rollNumber || formData.rollNumber.trim().length < 3) {
    errors.rollNumber = 'Please enter a valid CVRGU Roll / Registration Number.';
  }

  if (!formData.department) {
    errors.department = 'Please select your academic department.';
  }

  const passwordStrong = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password || '');
  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (!passwordStrong) {
    errors.password = 'Password must contain at least one uppercase letter, one number, and one special character.';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates login form inputs.
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'University email address is required.';
  } else if (!isCguEmail(email)) {
    errors.email = 'Only @cgu-odisha.ac.in email addresses are allowed.';
  }

  if (!password || password.length === 0) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
