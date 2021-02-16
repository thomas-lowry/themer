export async function isPublished(styles:BaseStyle[]) {

    let numOfStyles:number = styles.length;
    let numOfPublishedStyles:number = 0;
    let publishedStatus:string;

    //check to see if each style is published
    for await (const style of styles) {
        let published = await style.getPublishStatusAsync();
        if (published === 'CURRENT') {
            numOfPublishedStyles++;
        }
    }

    //determine if all styles are published, some, or none
    if (numOfPublishedStyles === numOfStyles) {
        publishedStatus = 'all';
    } else if (numOfPublishedStyles > 1 && numOfPublishedStyles < numOfStyles) {
        publishedStatus = 'some';
    } else {
        publishedStatus = 'none';
    }

    //return the results
    return publishedStatus;
    
}