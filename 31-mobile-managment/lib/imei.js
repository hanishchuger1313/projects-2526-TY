export const IMEI_REGEX = /^\d{15}$/;

export function normalizeImei(value = '') {
  return String(value).trim();
}

export function isValidImei(value = '') {
  return IMEI_REGEX.test(normalizeImei(value));
}

export function toImeiInputValue(value = '') {
  return String(value).replace(/\D/g, '').slice(0, 15);
}
