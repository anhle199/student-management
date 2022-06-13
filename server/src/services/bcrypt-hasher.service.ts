export interface PasswordHasher<T = string> {
  hashPassword(password: T): Promise<T>
  
}
