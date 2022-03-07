import type { Credentials } from "./types";

export function manageCredentials(type: string) {
  if (type.includes("read")) {
    readUICredentials();
  } else if (type.includes("delete")) {
    deleteUICredentials();
  }
}

async function readUICredentials() {
  try {
    let url = await figma.clientStorage.getAsync("apiURL");
    let secret = await figma.clientStorage.getAsync("apiSecret");

    figma.ui.postMessage({
      type: "credentials:read",
      payload: { secret, url } as Credentials,
    });
  } catch {
    figma.closePlugin("An error occured when getting the credentials.");
    return;
  }
}

async function deleteUICredentials() {
  try {
    await figma.clientStorage.setAsync("apiURL", "");
    await figma.clientStorage.setAsync("apiSecret", "");

    figma.ui.postMessage({
      type: "credentials:delete",
      payload: { secret: null, url: null } as Credentials,
    });
    figma.notify("Themer reset successfully");
  } catch {
    figma.notify(
      "There was an issue saving your credentials. Please try again."
    );
  }
}
