export function firstLetterLowerCase(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function firstLetterUpperCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function format(text: string, args: object): string {
  Object.entries(args).forEach((data) => {
    let reg = new RegExp(data[0], 'g');
    text = text.replace(reg, data[1]);
  });

  return text;
}

export function toCamel(string: string): string {
  return firstLetterLowerCase(
    string.replace(/([\_\-]\w)/g, (m) => m[1].toUpperCase())
  );
}

export function toKebab(string: string): string {
  return string.replace(/[\_\-]/g, '-').toLowerCase();
}

export function toScreamingSnake(string: string): string {
  return toKebab(string).replace(/-/g, '_').toUpperCase();
}

export function pathToTagName(string: string): string {
  return string.split('/').join('-').toLowerCase();
}
