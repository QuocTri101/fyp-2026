/** Longest side of a stored photo. Big enough for the service card, small enough to keep rows light. */
const MAX_SIDE = 480

/** Reads a picked file, shrinks it and returns a JPEG data URL (about 20-60 KB). */
export async function fileToDataUrl(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Choose a PNG, JPEG or WebP picture.')
  if (file.size > 8 * 1024 * 1024) throw new Error('That picture is over 8 MB. Choose a smaller one.')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser could not process the picture.')
  ctx.fillStyle = '#ffffff' // transparent PNGs become white instead of black
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', 0.82)
}
