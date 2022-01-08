export function firstLetterLowerCase(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function firstLetterUpperCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function format(text: string, args: object): string {
  Object.entries(args).forEach((data) => {
    let reg = new RegExp(data[0], 'g');
    text = text.replace(reg, data[1]);
  });

  return text;
}

export function toCamel(string) {
  return firstLetterLowerCase(
    string.replace(/([\_\-]\w)/g, (m) => m[1].toUpperCase())
  );
}

export function toKebab(string) {
  return string.replace(/[\_\-]/g, '-').toLowerCase();
}

export function toScreamingSnake(string) {
  return toKebab(string).replace(/-/g, '_').toUpperCase();
}
