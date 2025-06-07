
export function getMediaUrl(key: string) {
  return `${process.env.NEXT_PUBLIC_API_ROOT}/product-media/${key}`
}
