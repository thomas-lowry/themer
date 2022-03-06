let apiSecret: string;
let apiURL: string;

// THEME DATA VARS
// this is the latest data from JSON Bin,
// we will append this to the cleaned data
let jsonBinData = [];

// this is all of the raw styles data we collect when creating a new theme
// it may contain duplicates, and themes using prefixed names have not been split up
let collectedStyleData = [];

// clean data, this is an array of all of the processed new data
let cleanedStyleData = [];

// this is the assembled clean data that is ready
// to be sent back to the UI to push to JSON bin
let newJsonBinData = [];

// settings
let usePrefixes: boolean;
let newThemeName: string;
let newThemeCount = 0;
let existingThemeCount: number;
let selectedTheme: string;

figma.showUI(__html__, { width: 240, height: 312 });

async function init() {
  try {
    apiURL = await figma.clientStorage.getAsync("apiURL");
    apiSecret = await figma.clientStorage.getAsync("apiSecret");

    if (apiURL && apiSecret) {
      figma.ui.postMessage({
        type: "apiCredentials",
        status: true,
        url: apiURL,
        secret: apiSecret,
      });
    } else {
      figma.ui.postMessage({
        type: "apiCredentials",
        status: false,
      });
    }
  } catch (err) {
    figma.closePlugin("An error occured while initializing the plugin.");
    return;
  }
}
init();

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "notify":
      figma.notify(msg.msg, { timeout: 1500 });
      break;

    case "initialThemerData":
      updateCredentials(msg.secret, msg.url);
      figma.notify(msg.msg, { timeout: 1000 });
      break;

    case "applyTheme":
      selectedTheme = msg.themeName;
      applyTheme(msg.applyTo);
      break;

    case "createTheme":
      updatedDataFromAPI(msg.apiData);
      createTheme(msg);
      break;

    case "deleteTheme":
      updatedDataFromAPI(msg.themeData);
      figma.notify(msg.msg, { timeout: 1000 });
      break;

    case "updateThemes":
      updatedDataFromAPI(msg.themeData);
      break;

    case "reset":
      resetThemer();
      break;
  }
};

function resetThemer() {
  (async () => {
    try {
      await figma.clientStorage.setAsync("apiSecret", "");
      await figma.clientStorage.setAsync("apiURL", "");
    } catch (err) {
      figma.notify(
        "There was an issue saving your credentials. Please try again."
      );
    }
  })();
  figma.notify("Themer reset successfully");
}

function createTheme(data) {
  // set prefixes setting
  if (data.usePrefixes === true) {
    usePrefixes = true;
  } else {
    usePrefixes = false;
  }

  //determine name
  if (data.themeName) {
    newThemeName = data.themeName;
  }

  clearStyleData();

  // use the correct method to collect styles
  // based on user selection
  switch (data.source) {
    case "local":
      //get styles
      if (data.colorStyles) {
        getLocalStyles("color");
      }
      if (data.textStyles) {
        getLocalStyles("text");
      }
      if (data.effectStyles) {
        getLocalStyles("effect");
      }

      break;

    case "selection":
      // get styles from selection
      let selection = Array.from(figma.currentPage.selection);
      if (selection) {
        //get styles
        if (data.colorStyles) {
          selection.forEach((node) => {
            collectColorStyles(node);
          });
        }
        if (data.textStyles) {
          selection.forEach((node) => {
            collectTextStyles(node);
          });
        }
        if (data.effectStyles) {
          selection.forEach((node) => {
            collectEffectStyles(node);
          });
        }
      } else {
        figma.notify("Please make a selection");
      }

      break;

    case "page":
      //get nodes from entire page
      let pageNodes = Array.from(figma.currentPage.children);
      if (pageNodes) {
        //get styles
        if (data.colorStyles) {
          pageNodes.forEach((node) => {
            collectColorStyles(node);
          });
        }
        if (data.textStyles) {
          pageNodes.forEach((node) => {
            collectTextStyles(node);
          });
        }
        if (data.effectStyles) {
          pageNodes.forEach((node) => {
            collectEffectStyles(node);
          });
        }
      } else {
        figma.notify("There is nothing on this page");
      }

      break;
  }

  // merge with existing data
  mergeNewThemesWithExisting();

  // count number of themes being added
  // in most cases it will be 1
  // unless the user is creating multiple themes at once
  // by splitting them at prefixes
  countNewThemes();

  // send data back to UI to post to JSON bin
  sendNewThemeDataToUI();
}

function getLocalStyles(type) {
  if (type === "color") {
    let colorStyles = figma.getLocalPaintStyles();
    if (colorStyles) {
      colorStyles.forEach((color) => {
        let style = {
          name: styleName(color.name),
          key: color.key,
          theme: themeName(color.name),
          type: "PAINT",
        };
        if (style.name && style.key && style.theme && style.type) {
          collectedStyleData.push(style);
        } else {
          figma.notify("Error adding theme");
          throw new Error("Error adding theme");
        }
      });
    } else {
      figma.notify("There are no color styles in the document");
    }
  } else if (type === "text") {
    let textStyles = figma.getLocalTextStyles();
    if (textStyles) {
      textStyles.forEach((text) => {
        let style = {
          name: styleName(text.name),
          key: text.key,
          theme: themeName(text.name),
          type: "TEXT",
        };
        if (style.name && style.key && style.theme && style.type) {
          collectedStyleData.push(style);
        } else {
          figma.notify("Error adding theme");
          throw new Error("Error adding theme");
        }
      });
    } else {
      figma.notify("There are no text styles in the document");
    }
  } else if (type === "effect") {
    let effectStyles = figma.getLocalEffectStyles();
    if (effectStyles) {
      effectStyles.forEach((effect) => {
        let style = {
          name: styleName(effect.name),
          key: effect.key,
          theme: themeName(effect.name),
          type: "EFFECT",
        };
        if (style.name && style.key && style.theme && style.type) {
          collectedStyleData.push(style);
        } else {
          figma.notify("Error adding theme");
          throw new Error("Error adding theme");
        }
      });
    } else {
      figma.notify("There are no effect styles in the document");
    }
  }
}

function collectColorStyles(node) {
  // check for children on note, if they exist, run them through this function
  // this will help us walk the tree to the bottom most level
  if (node.children) {
    node.children.forEach((child) => {
      collectColorStyles(child);
    });
  }

  //here is where we grab all of the styles if they exist on the node
  if (node.type === "COMPONENT" || "INSTANCE" || "FRAME" || "GROUP") {
    if (node.backgroundStyleId) {
      let objectStyle = figma.getStyleById(node.backgroundStyleId);
      // key will only be available for remote styles
      if (objectStyle.key) {
        let style = {
          name: styleName(objectStyle.name),
          key: objectStyle.key,
          theme: themeName(objectStyle.name),
          type: "PAINT",
        };
        if (style.name && style.key && style.theme && style.type) {
          collectedStyleData.push(style);
        } else {
          figma.notify("Error adding theme");
          throw new Error("Error adding theme");
        }
      }
    }
  }
  if (
    node.type === "RECTANGLE" ||
    "POLYGON" ||
    "ELLIPSE" ||
    "STAR" ||
    "TEXT" ||
    "VECTOR" ||
    "BOOLEAN_OPERATION" ||
    "LINE"
  ) {
    if (node.fillStyleId) {
      let objectStyle = figma.getStyleById(node.fillStyleId);
      // key will only be available for remote styles
      if (objectStyle.key) {
        let style = {
          name: styleName(objectStyle.name),
          key: objectStyle.key,
          theme: themeName(objectStyle.name),
          type: "PAINT",
        };
        if (style.name && style.key && style.theme && style.type) {
          collectedStyleData.push(style);
        } else {
          figma.notify("Error adding theme");
          throw new Error("Error adding theme");
        }
      }
    }
    if (node.strokeStyleId) {
      let objectStyle = figma.getStyleById(node.strokeStyleId);
      // key will only be available for remote styles
      if (objectStyle.key) {
        let style = {
          name: styleName(objectStyle.name),
          key: objectStyle.key,
          theme: themeName(objectStyle.name),
          type: "PAINT",
        };
        if (style.name && style.key && style.theme && style.type) {
          collectedStyleData.push(style);
        } else {
          figma.notify("Error adding theme");
          return;
        }
      }
    }
  }
}

function collectTextStyles(node) {
  // check for children on note, if they exist, run them through this function
  // this will help us walk the tree to the bottom most level
  if (node.children) {
    node.children.forEach((child) => {
      collectTextStyles(child);
    });
  }

  if (node.type === "TEXT" && node.textStyleId != "MIXED" && node.textStyleId) {
    let objectStyle = figma.getStyleById(node.textStyleId);
    // key will only be available for remote styles
    if (objectStyle.key) {
      let style = {
        name: styleName(objectStyle.name),
        key: objectStyle.key,
        theme: themeName(objectStyle.name),
        type: "TEXT",
      };
      if (style.name && style.key && style.theme && style.type) {
        collectedStyleData.push(style);
      } else {
        figma.notify("Error adding theme");
        throw new Error("Error adding theme");
      }
    }
  }
}

function collectEffectStyles(node) {
  if (node.children) {
    node.children.forEach((child) => {
      collectEffectStyles(child);
    });
  }
  if (node.effectStyleId) {
    let objectStyle = figma.getStyleById(node.effectStyleId);
    // key will only be available for remote styles
    if (objectStyle.key) {
      let style = {
        name: styleName(objectStyle.name),
        key: objectStyle.key,
        theme: themeName(objectStyle.name),
        type: "TEXT",
      };
      if (style.name && style.key && style.theme && style.type) {
        collectedStyleData.push(style);
      } else {
        figma.notify("Error adding theme");
        throw new Error("Error adding theme");
      }
    }
  }
}

function sendNewThemeDataToUI() {
  if (cleanedStyleData) {
    figma.ui.postMessage({
      type: "addNewTheme",
      themeCount: newThemeCount,
      themeData: JSON.stringify(newJsonBinData),
    });
  } else {
    figma.notify("There are no styles to create a theme from");
    return;
  }
}

function themeName(name) {
  if (usePrefixes) {
    if (name.includes("/")) {
      let prefix = name.split("/");
      return prefix[0];
    } else {
      figma.notify("Styles names must be prefixed. Ex: themeName/colorName");
    }
  } else {
    return newThemeName;
  }
}

function styleName(name) {
  if (usePrefixes) {
    if (name.includes("/")) {
      let styleName = name.split("/").slice(1).join(".");
      return styleName;
    } else {
      figma.notify("Styles names must be prefixed. Ex: themeName/colorName");
    }
  } else {
    return name;
  }
}

function countNewThemes() {
  let themes = [...new Set(cleanedStyleData.map((style) => style.theme))];
  newThemeCount = themes.length;
}

function clearStyleData() {
  collectedStyleData = [];
  cleanedStyleData = [];
  newJsonBinData = [];
}

function mergeNewThemesWithExisting() {
  cleanedStyleData = removeDuplicatesBy(
    (style) => style.key,
    collectedStyleData
  );
  if (cleanedStyleData) {
    if (existingThemeCount === 0) {
      cleanedStyleData.forEach((style) => {
        newJsonBinData.push(style);
      });
    } else {
      jsonBinData.forEach((style) => {
        newJsonBinData.push(style);
      });
      cleanedStyleData.forEach((style) => {
        newJsonBinData.push(style);
      });
    }
  } else {
    figma.notify("Something went wrong while processing your theme data");
  }
}

// APPLY THEME
function applyTheme(applyTo) {
  let nodes;
  if (applyTo === "selection") {
    if (figma.currentPage.selection) {
      nodes = figma.currentPage.selection;
    } else {
      figma.notify("Please make a selection");
    }
  } else {
    if (figma.currentPage.children) {
      nodes = figma.currentPage.children;
    } else {
      figma.notify("Please make a selection");
    }
  }
  if (nodes) {
    figma.notify("Applying theme...", { timeout: 1000 });

    let colorStyles = [
      ...new Set(
        jsonBinData.map(
          (style) => style.theme === selectedTheme && style.type === "PAINT"
        )
      ),
    ];
    let textStyles = [
      ...new Set(
        jsonBinData.map(
          (style) => style.theme === selectedTheme && style.type === "TEXT"
        )
      ),
    ];
    let effectStyles = [
      ...new Set(
        jsonBinData.map(
          (style) => style.theme === selectedTheme && style.type === "EFFECT"
        )
      ),
    ];

    //if the theme contains color styles
    //iterate through all nodes to find color styles that match
    if (colorStyles) {
      nodes.forEach((node) => {
        applyColor(node);
      });
    }

    //if the theme contains text styles
    //iterate through all nodes to find text styles that match
    if (textStyles) {
      nodes.forEach((node) => {
        applyText(node);
      });
    }

    //if the theme contains effect styles
    //iterate through all nodes to find effect styles that match
    if (effectStyles) {
      nodes.forEach((node) => {
        applyEffect(node);
      });
    }
  } else {
    figma.notify("There is nothing to apply styles to");
  }
}

function applyColor(node) {
  //iterate through children if the node has them
  if (node.children) {
    node.children.forEach((child) => {
      applyColor(child);
    });
  }

  //handle background fills
  if (node.type === "COMPONENT" || "INSTANCE" || "FRAME" || "GROUP") {
    if (node.backgroundStyleId) {
      (async function () {
        let style = figma.getStyleById(node.backgroundStyleId) as PaintStyle;
        if (style.key) {
          let newStyleKey = findMatchInSelectedTheme(style.key);
          if (newStyleKey) {
            let newStyle = (await figma.importStyleByKeyAsync(
              newStyleKey
            )) as PaintStyle;
            if (newStyle) {
              node.backgroundStyleId = newStyle.id;
            }
          }
        }
      })();
    }
  }

  //handle fills + strokes
  if (
    node.type === "RECTANGLE" ||
    "POLYGON" ||
    "ELLIPSE" ||
    "STAR" ||
    "TEXT" ||
    "VECTOR" ||
    "BOOLEAN_OPERATION" ||
    "LINE"
  ) {
    //fills
    if (node.fillStyleId) {
      (async function () {
        let style = figma.getStyleById(node.fillStyleId) as PaintStyle;
        if (style.key) {
          let newStyleKey = findMatchInSelectedTheme(style.key);
          if (newStyleKey) {
            let newStyle = (await figma.importStyleByKeyAsync(
              newStyleKey
            )) as PaintStyle;
            if (newStyle) {
              node.fillStyleId = newStyle.id;
            }
          }
        }
      })();
    }
    //strokes
    if (node.strokeStyleId) {
      (async function () {
        let style = figma.getStyleById(node.strokeStyleId) as PaintStyle;
        if (style.key) {
          let newStyleKey = findMatchInSelectedTheme(style.key);
          if (newStyleKey) {
            let newStyle = (await figma.importStyleByKeyAsync(
              newStyleKey
            )) as PaintStyle;
            if (newStyle) {
              node.strokeStyleId = newStyle.id;
            }
          }
        }
      })();
    }
  }
}

function applyText(node) {
  //iterate through children if the node has them
  if (node.children) {
    node.children.forEach((child) => {
      applyText(child);
    });
  }
  // apply text styles
  if (node.type === "TEXT") {
    if (node.textStyleId) {
      if (typeof node.textStyleId !== "symbol") {
        (async function () {
          let style = figma.getStyleById(node.textStyleId) as TextStyle;
          if (style.key) {
            let newStyleKey = findMatchInSelectedTheme(style.key);
            if (newStyleKey) {
              let newStyle = (await figma.importStyleByKeyAsync(
                newStyleKey
              )) as TextStyle;
              let fontFamily = newStyle.fontName.family;
              let fontStyle = newStyle.fontName.style;
              await figma.loadFontAsync({
                family: fontFamily,
                style: fontStyle,
              });
              if (newStyle) {
                node.textStyleId = newStyle.id;
              }
            }
          }
        })();
      } else {
        figma.notify(
          "Note: Themer currently skips text objects with multiple text styles applied."
        );
      }
    }
  }
}

function applyEffect(node) {
  //iterate through children if the node has them
  if (node.children) {
    node.children.forEach((child) => {
      applyEffect(child);
    });
  }

  //apply effects
  if (
    node.type === "COMPONENT" ||
    "INSTANCE" ||
    "FRAME" ||
    "GROUP" ||
    "RECTANGLE" ||
    "POLYGON" ||
    "ELLIPSE" ||
    "STAR" ||
    "TEXT" ||
    "VECTOR" ||
    "BOOLEAN_OPERATION" ||
    "LINE"
  ) {
    if (node.effectStyleId) {
      (async function () {
        let style = figma.getStyleById(node.effectStyleId) as EffectStyle;
        if (style.key) {
          let newStyleKey = findMatchInSelectedTheme(style.key);
          if (newStyleKey) {
            let newStyle = await figma.importStyleByKeyAsync(newStyleKey);
            if (newStyle) {
              node.effectStyleId = newStyle.id;
            }
          }
        }
      })();
    }
  }
}

// HELPER FUNCTIONS
function findMatchInSelectedTheme(styleKey) {
  // this gets item in the array which matches the current style applied
  let currentStyle = jsonBinData.find((style) => style.key === styleKey);

  // if we find a matching style execute this
  if (currentStyle) {
    //this gets the name of the current style
    //we need the name of the current style so we can search the jsonbin array
    //for matches with the selected theme
    let name = currentStyle.name;
    let matchedStyle = jsonBinData.find(
      (style) => style.name === name && style.theme === selectedTheme
    );

    if (matchedStyle) {
      //if we find a match in the selected theme, we will return the style key
      // so that we can import the style into the doc
      return matchedStyle.key;
    }
  }
}

function updatedDataFromAPI(data) {
  clearStyleData();

  //this passes the data sent from API -> UI -> jsonBinData var
  jsonBinData = JSON.parse(data);

  // here we want to see if there is at least one existing theme
  // if there is, we will append subsequent themes to the data
  // if its the first theme, we want to overwrite the same content
  // that was required to to create an empty bin
  console.log(jsonBinData);

  if (jsonBinData[0].theme === undefined) {
    existingThemeCount = 0;
  }
}

function updateCredentials(secret, url) {
  (async () => {
    try {
      await figma.clientStorage.setAsync("apiSecret", secret);
      await figma.clientStorage.setAsync("apiURL", url);
    } catch (err) {
      figma.notify(
        "There was an issue saving your credentials. Please try again."
      );
    }
  })();
}

function removeDuplicatesBy(keyFn, array) {
  var mySet = new Set();
  return array.filter(function (x) {
    var key = keyFn(x),
      isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}
