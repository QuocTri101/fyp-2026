/**
 * EAN-13 barcode encoding, so product barcodes can be drawn without an extra library.
 * An EAN-13 is 95 narrow bars: start guard, 6 left digits, middle guard, 6 right digits, end guard.
 * The first digit is not drawn; it picks which of two patterns (L or G) each left digit uses.
 */
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111']
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

/** Last digit of an EAN-13: weights 1,3,1,3... over the first 12 digits. */
export function ean13CheckDigit(first12: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3)
  return (10 - (sum % 10)) % 10
}

export function isValidEan13(code: string): boolean {
  return /^\d{13}$/.test(code) && ean13CheckDigit(code.slice(0, 12)) === Number(code[12])
}

/** A string of 95 "0" and "1" characters: 1 is a black bar, 0 is a gap. Null if the code is not a valid EAN-13. */
export function ean13Modules(code: string): string | null {
  if (!isValidEan13(code)) return null

  const parity = PARITY[Number(code[0])]
  let bits = '101'
  for (let i = 0; i < 6; i++) {
    const digit = Number(code[i + 1])
    bits += parity[i] === 'L' ? L[digit] : G[digit]
  }
  bits += '01010'
  for (let i = 0; i < 6; i++) bits += R[Number(code[i + 7])]
  bits += '101'
  return bits
}
