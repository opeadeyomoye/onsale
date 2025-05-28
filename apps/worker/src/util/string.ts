
export function randomString(len = 16) {
  const source = strShuffle('0123456789ABCDEFGHJKLMNPQRSTVWXYZabcdefghjklmnpqrstvwxyz')

  len = Math.min(len, source.length)

  const [min, max] = [0, source.length - 1 - len]
  const start = Math.floor(Math.random() * (max - min + 1)) + min

  return source.substring(start, start + len)
}

export function strShuffle(str: string) {
  let newStr = ''
  let rand
  let i = str.length

  while (i) {
    rand = Math.floor(Math.random() * i)
    newStr += str.charAt(rand)
    str = str.substring(0, rand) + str.substr(rand + 1)
    i--
  }

  return newStr
}

/**
 * Courtesy of {@link https://byby.dev/js-slugify-string}
 */
export function slugify(str: string) {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}
