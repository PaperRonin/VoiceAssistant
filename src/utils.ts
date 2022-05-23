import log from "loglevel";

export function sleep(ms): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function replaceWordsWithNumbers(text: string) {
    let dict = new Map([
        [" один", "1"],
        [" два", "2"],
        [" три", "3"],
        [" четыре", "4"],
        [" пять", "5"],
        [" шесть", "6"],
        [" семь", "7"],
        [" восемь", "8"],
        [" девять", "9"]
    ])
    dict.forEach(function (value, key) {
        text = text.replace(key, value)
    })

    return text
}
