//get size of json
export function jsonSize(data) {
    let size = new TextEncoder().encode(JSON.stringify(data)).length
    let kiloBytes = size / 1024;
    let megaBytes = kiloBytes / 1024;
    return kiloBytes;
}