
import { domainToASCII, domainToUnicode } from "node:url";

export function normalizeEmail(email: string): string {
  const value = email.trim().toLowerCase();

  const atIndex = value.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === value.length - 1) {
    return value;
  }

  const localPart = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);

  const asciiDomain = domainToASCII(domain);

  if (!asciiDomain) {
    return value;
  }

  return `${localPart}@${asciiDomain}`;
}

export function displayEmail(email: string): string {
  const value = email.trim().toLowerCase();

  const atIndex = value.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === value.length - 1) {
    return value;
  }

  const localPart = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);

  const unicodeDomain = domainToUnicode(domain);

  if (!unicodeDomain) {
    return value;
  }

  return `${localPart}@${unicodeDomain}`;
}
