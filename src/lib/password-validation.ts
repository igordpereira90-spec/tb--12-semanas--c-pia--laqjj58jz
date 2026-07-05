export interface PasswordValidation {
  valid: boolean
  errors: string[]
  checks: { label: string; passed: boolean }[]
}

export function validatePassword(password: string): PasswordValidation {
  const checks = [
    { label: 'Mínimo de 8 caracteres', passed: password.length >= 8 },
    { label: 'Pelo menos uma letra maiúscula', passed: /[A-Z]/.test(password) },
    { label: 'Pelo menos um número', passed: /[0-9]/.test(password) },
    {
      label: 'Pelo menos um caractere especial',
      passed: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
    },
  ]
  const errors = checks.filter((c) => !c.passed).map((c) => c.label)
  return { valid: errors.length === 0, errors, checks }
}
