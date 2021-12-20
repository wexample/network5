export function format(text: string, args: object): string {
  Object.entries(args).forEach((data) => {
    let reg = new RegExp(data[0], 'g');
    text = text.replace(reg, data[1]);
  });

  return text;
}

export function firstLetterUpperCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function firstLetterLowerCase(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function toCamel(string) {
  return firstLetterLowerCase(
    string.replace(/([\_\-]\w)/g, (m) => m[1].toUpperCase())
  );
}
