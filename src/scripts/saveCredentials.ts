export function saveCredentials(apiKey, apiURL) {
    (async () => {
        try {
            await figma.clientStorage.setAsync('apiSecret', apiKey);
            await figma.clientStorage.setAsync('apiURL', apiURL);

            console.log('binURL: ', apiURL);

        } catch (err) {
            figma.notify('There was an issue saving your settings. Please try again.');
        }
    })();

    figma.notify('JSONBin setup successful. You can start creating themes now.');
}