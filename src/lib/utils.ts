import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateCPF(cpf: string): boolean {
  const strCPF = cpf.replace(/[^\d]+/g, '')
  if (strCPF.length !== 11) return false

  if (/^(\d)\1{10}$/.test(strCPF)) return false

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++)
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(strCPF.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++)
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(strCPF.substring(10, 11))) return false

  return true
}

export function formatCPF(value: string): string {
  const cpf = value.replace(/\D/g, '')
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export function formatPhone(value: string): string {
  const phone = value.replace(/\D/g, '')
  if (phone.length > 10) {
    return phone.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3')
  } else if (phone.length > 5) {
    return phone.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3')
  } else if (phone.length > 2) {
    return phone.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2')
  } else {
    return phone.replace(/^(\d*)/, '($1')
  }
}
