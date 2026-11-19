/** Mirrors eCommerceCar.SharedLibrary.Responses.Response */
export interface ApiResponse {
  flag: boolean
  message: string
}

/** Fields the user fills in. Id and Role are set by the API layer (see auth.ts). */
export interface RegisterRequest {
  name: string
  phoneNumber: string
  address: string
  email: string
  password: string
}
