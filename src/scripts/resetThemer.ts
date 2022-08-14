export function resetThemer() {
    (async () => {
        try {
            await figma.clientStorage.setAsync('apiSecret', '');
            await figma.clientStorage.setAsync('apiURL', '');
        } catch (err) {
            figma.notify('There was an issue resetting your settings. Please try again.');
        }
    })();
    figma.notify('Themer was successfully reset');

    //reinitialize themer
    figma.ui.postMessage({
        'type': 'reset'
    });
}