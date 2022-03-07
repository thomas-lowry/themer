export function subscribe(type: string, callback?: (payload: unknown) => void) {
  parent.postMessage({ pluginMessage: { type } }, "*");

  window.onmessage = (evt: MessageEvent) => {
    if (evt.data.pluginMessage.type === type) {
      callback?.(evt.data.pluginMessage.payload);
    }
  };
}
