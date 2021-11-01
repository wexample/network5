export function format(text: string, args: object): string {
    Object.entries(args).forEach((data) => {
        let reg = new RegExp(data[0], 'g');
        text = text.replace(reg, data[1]);
    });

    return text;
}