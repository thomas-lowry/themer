export function assembleStylesArray(styles) {
    let reformatedArray = [];

    console.log('pre reform:', styles);

    //Reformat array
    styles.forEach(style => {
        let item = {
            name: style.name,
            key: style.key,
            id: style.id,
            theme: '',
            type: style.type
        }
        reformatedArray.push(item);
    });

    console.log('reform: ', reformatedArray);

    //filter our duplicate entries
    let keys = reformatedArray.map(o => o.key)
    let filteredArray = reformatedArray.filter(({key}, index) => !keys.includes(key, index + 1))
    
    return filteredArray;
}
