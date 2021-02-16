export function assembleStylesArray(styles) {
    let stylesArray:Array<Object> = [];

    styles.forEach(style => {
        let item = {
            name: style.name,
            id: style.id,
            key: style.key,
            type: style.type
        }
        stylesArray.push(item);
    })

    return stylesArray
}