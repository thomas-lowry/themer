export function assembleStylesArray(styles) {
    let reformatedArray = [];


    //Reformat array
    styles.forEach(style => {
        let item = {
            name: style.name,
            key: style.key,
            id: style.id,
            theme: '',
            type: style.type
        }

        let firstChar = item.name.charAt(0);
        if(firstChar === '.' || '_') {
            reformatedArray.push(item);
        }
    });

    //filter our duplicate entries
    let keys = reformatedArray.map(o => o.key)
    let filteredArray = reformatedArray.filter(({key}, index) => !keys.includes(key, index + 1))
    
    return filteredArray;
}
