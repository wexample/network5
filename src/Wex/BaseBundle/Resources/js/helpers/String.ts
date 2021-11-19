export function format(text: string, args: object): string {
  Object.entries(args).forEach((data) => {
    let reg = new RegExp(data[0], 'g');
    text = text.replace(reg, data[1]);
  });

  return text;
}

/**
 * @see https://stackoverflow.com/a/34168882
 * @param length
 */
export function uniqueId(length: number = 32): string {
  // Always start with a letter -- base 36 makes for a nice shortcut.
  let id = (Math.floor(Math.random() * 25) + 10).toString(36);
  // Add a timestamp in milliseconds (base 36 again) as the base.
  id += new Date().getTime().toString(36);
  // Similar to above, complete the Id using random, alphanumeric characters.
  do {
    id += Math.floor(Math.random() * 35).toString(36);
  } while (id.length < length);

  return id;
}
