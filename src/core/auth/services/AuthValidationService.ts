import { LoginCredentials, RegisterData, ValidationResult } from '../types'

export class AuthValidationService {
  validateLogin(credentials: LoginCredentials): ValidationResult {
    const errors: { field: string; message: string }[] = []
    if (!credentials.email || !this.isValidEmail(credentials.email)) {
      errors.push({ field: 'email', message: 'Email tidak valid' })
    }
    if (!credentials.password || credentials.password.length < 8) {
      errors.push({ field: 'password', message: 'Password minimal 8 karakter' })
    }
    return { isValid: errors.length === 0, errors: errors.map(e => ({ field: e.field, message: e.message, code: 'VALIDATION_ERROR' })) }
  }

  validateRegistration(data: RegisterData & { fullName: string; phoneNumber: string }): ValidationResult {
    const errors: { field: string; message: string }[] = []
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push({ field: 'email', message: 'Email tidak valid' })
    }
    if (!data.password || data.password.length < 8) {
      errors.push({ field: 'password', message: 'Password minimal 8 karakter' })
    }
    if (!data.fullName || data.fullName.length < 3) {
      errors.push({ field: 'fullName', message: 'Nama lengkap minimal 3 karakter' })
    }
    if (!data.phoneNumber || !this.isValidPhoneNumber(data.phoneNumber)) {
      errors.push({ field: 'phoneNumber', message: 'Nomor telepon tidak valid' })
    }
    return { isValid: errors.length === 0, errors: errors.map(e => ({ field: e.field, message: e.message, code: 'VALIDATION_ERROR' })) }
  }

  validateEmail(email: string): ValidationResult {
    const errors: { field: string; message: string }[] = []
    if (!email || !this.isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Email tidak valid' })
    }
    return { isValid: errors.length === 0, errors: errors.map(e => ({ field: e.field, message: e.message, code: 'VALIDATION_ERROR' })) }
  }

  validatePassword(password: string): ValidationResult {
    const errors: { field: string; message: string }[] = []
    if (!password || password.length < 8) {
      errors.push({ field: 'password', message: 'Password minimal 8 karakter' })
    }
    return { isValid: errors.length === 0, errors: errors.map(e => ({ field: e.field, message: e.message, code: 'VALIDATION_ERROR' })) }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
}
