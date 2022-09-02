export function assembleStylesArray(styles) {
    let reformatedArray = [];

    console.log('num of input styles', styles.length);

    //Reformat array
    styles.forEach(style => {
        let item = {
            name: style.name,
            key: style.key,
            id: style.id,
            theme: '',
            type: style.type
        }

        let hidden:boolean = false;

        //check for hidden styles
        if(item.name.includes('_') || item.name.includes('.')) {
            let splitName = item.name.split('/');
            splitName.forEach(chunk => {
                if (chunk[0] === '_' || chunk[0] === '.') {
                    hidden = true;
                }
            })
        }   


        if(hidden === false) {
            reformatedArray.push(item);
        }


    });


    //filter our duplicate entries
    let keys = reformatedArray.map(o => o.key)
    let filteredArray = reformatedArray.filter(({key}, index) => !keys.includes(key, index + 1))

    console.log('num of output styles', reformatedArray.length);
    
    return filteredArray;
}
