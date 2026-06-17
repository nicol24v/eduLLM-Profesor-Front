const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
};

const trimStr = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim();
};

const collapseSpaces = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\s+/g, ' ');
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return collapseSpaces(trimStr(stripHtml(str)));
};

export const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => sanitizeData(item));
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = typeof value === 'string' ? sanitizeString(value) : sanitizeData(value);
  }
  return sanitized;
};

export { stripHtml, sanitizeString };
