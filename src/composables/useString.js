export function useString() {
  function toKebabCase(input) {
    if (typeof input !== 'string') return ''

    // Bỏ dấu tiếng Việt
    const vietnameseMap = {
      a: 'áàảãạâấầẩẫậăắằẳẵặ',
      e: 'éèẻẽẹêếềểễệ',
      i: 'íìỉĩị',
      o: 'óòỏõọôốồổỗộơớờởỡợ',
      u: 'úùủũụưứừửữự',
      y: 'ýỳỷỹỵ',
      d: 'đ',
    }

    let str = input.toLowerCase()
    for (const ascii in vietnameseMap) {
      const regex = new RegExp(`[${vietnameseMap[ascii]}]`, 'g')
      str = str.replace(regex, ascii)
    }

    // Thay khoảng trắng và _ bằng -
    str = str.replace(/[_\s]+/g, '-')

    // Loại bỏ ký tự không hợp lệ
    str = str.replace(/[^a-z0-9-]/g, '')

    // Bỏ - đầu/cuối
    str = str.replace(/^-+|-+$/g, '')

    return str
  }

  return {
    toKebabCase,
  }
}

export function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export function removeDiacritics(str) {
  return str
    .normalize('NFD') // chuẩn hóa unicode
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const removeEmptyStrings = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeEmptyStrings)
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => [key, removeEmptyStrings(value)]),
    )
  }

  return obj
}
