const addNewCommandUIpage = require("./screens/addNewCommandUIpage");
const { createNewCommand, saveCheckBoxStateByWorkspace, starupLogic, startTerminal, deleteActions, createBulkCommand, reStartTerminal, stopTerminal } = require("./functionality");
const HomePageUI = require("./screens/HomePageUI");
const reStartView = require("./screens/Resolve");
const vscode = require("vscode");
const path = require('path');

/**
 * project name
 */
const fancyProjectName = 'LaunchBoard';

/**
 * keys of storess
 */
const KEY_COMMANDS = 'LaunchBoard.dev.akash_c';
const KEY_STATE = 'LaunchBoard.dev.akash_s';
const KEY_PROJECTS = 'LaunchBoard.dev.akash_p';
const KEY_NUMBER = 'LaunchBoard.dev.akash_n';
const KEY_STARTUP = 'LaunchBoard.dev.akash_t';

let iconcache = undefined;

function getIcon(context) {
  if (iconcache) {
    return iconcache;
  } else {
    iconcache = vscode.Uri.file(
      path.join(context.extensionPath, 'icon.png') // Icon is in the root folder
    );
    return iconcache;
  }
}


function getProjectRoot() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath; // This is the stable project directory
  }
  return null; // No workspace open
}




/***
 * Actual object store the datas
 */
let CurrentContextVscode;

let isStartup = {};
let commandStore = {};
let checkBoxState = {};
let eachProjectLocator = [];
let count = 0;
const activeTerminals = {};
const TERMINAL_IdMap = new Map(); // used map here to store terminal refrence as key
const cacheUI = {};
let projectDirectory;

let reloadUI = 0;
let UiReloadedBy = {};

let statusBarIcon;
function hideStatusBarLoading() {
  if (statusBarIcon) {
    statusBarIcon.command = 'LaunchBoard';
    statusBarIcon.text = `$(zap) ${fancyProjectName}`;  // $(zap) is an icon from the Octicons set
    statusBarIcon.tooltip = `Open ${fancyProjectName}`;
  }
}

function showStatusBarLoading() {
  if (statusBarIcon) {
    statusBarIcon.command = 'LaunchBoard';
    statusBarIcon.text = `$(sync~spin) ${fancyProjectName}...`;
    statusBarIcon.tooltip = `Launching ${fancyProjectName}...`;
  }
}

function allowUIReload(Times) {
  reloadUI = Times;
  UiReloadedBy = {};
}



function init(context) {
  commandStore = context.globalState.get(KEY_COMMANDS) || {};
  checkBoxState = context.globalState.get(KEY_STATE) || {};
  eachProjectLocator = context.globalState.get(KEY_PROJECTS) || [];
  count = context.globalState.get(KEY_NUMBER) || 0;
  isStartup = context.globalState.get(KEY_STARTUP) || {};
}

function fullBackup({ KEY_COMMANDS: c, KEY_STATE: k, KEY_PROJECTS: p, KEY_NUMBER: n, KEY_STARTUP: t, all } = { all: true, KEY_COMMANDS, KEY_STATE, KEY_PROJECTS, KEY_NUMBER, KEY_STARTUP }) {

  (all || c) && CurrentContextVscode.globalState.update(KEY_COMMANDS, commandStore);
  (all || k) && CurrentContextVscode.globalState.update(KEY_STATE, checkBoxState);
  (all || p) && CurrentContextVscode.globalState.update(KEY_PROJECTS, eachProjectLocator);
  (all || n) && CurrentContextVscode.globalState.update(KEY_NUMBER, count);
  (all || t) && CurrentContextVscode.globalState.update(KEY_STARTUP, isStartup);
}

function loadOrRenderCacheUI(cacheKey, uiFunction, panel) {
  let cache = cacheUI[cacheKey];
  if (!cache || reloadUI > 0 && !UiReloadedBy[cacheKey]) {
    cache = uiFunction?.();
    cacheUI[cacheKey] = cache;
    if (reloadUI - 1 > -1) {
      UiReloadedBy[cacheKey] = true;
      reloadUI--;
      if (reloadUI === 0) {
        //reached 0; clearing all to once more allow reload
        UiReloadedBy = {};
      }
    }
  }
  panel && (panel.webview.html = cache);
}

function setCachedUI(cacheKey, cachedUI) {
  cacheUI[cacheKey] = cachedUI;
}


//-------------------------------------------------🍟🚒💥--------------------------------------------------

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  CurrentContextVscode = context;
  projectDirectory = getProjectRoot();
  /**
   * initializations
   */ init(context);


  function persistStore(key, data) {
    context.globalState.update(key, data);
  }




  //#EVENTS



  // Handle terminal close event
  vscode.window.onDidCloseTerminal(Terminal => {
    const { terminal, name, id } = TERMINAL_IdMap.get(Terminal);
    if (terminal && name) {
      TERMINAL_IdMap.delete(Terminal);
      delete activeTerminals[id];
      vscode.window.showInformationMessage(`${name} has been closed.`);
    }
  });


  let panel;

  const common = {
    getStartup: () => isStartup,
    checkBoxState: () => checkBoxState,
    setCheckBoxState: (newState = {}) => {
      checkBoxState = newState;
    },
    projectDirectory,
    setEachProjectLocator: (newRefrenceOfArray = []) => {
      eachProjectLocator = newRefrenceOfArray;
    },
    fancyProjectName,
    eachProjectLocator: () => eachProjectLocator,
    panel: () => panel,
    vscode,
    cacheUI: () => cacheUI,
    TERMINAL_IdMap: () => TERMINAL_IdMap,
    activeTerminals: () => activeTerminals,
    count: () => count++,
    commandStore: () => commandStore,
  };




  const Screen = vscode.commands.registerCommand('LaunchBoard', () => {
    // Check if the webview panel is already open
    if (panel) {

      if (panel.visible) {
        panel.dispose();
        panel = null;
      } else {
        panel.reveal(vscode.ViewColumn.One);
      }

    } else {
      showStatusBarLoading();
      panel = vscode.window.createWebviewPanel(
        'LaunchBoard',
        fancyProjectName,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      panel.iconPath = getIcon(context);

      // When the panel is closed, reset the panel variable
      panel.onDidDispose(() => {
        panel = null;
      });



      //setting initial UI home page
      loadOrRenderCacheUI("home", () => HomePageUI(common), panel);

      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        (response) => {

          switch (response.callMethod) {
            //===========> UI first
            case 'homePage':
              loadOrRenderCacheUI("home", () => HomePageUI(common), panel);
              break;
            case 'addNewCommandUI':
              loadOrRenderCacheUI("addNewCommand", () => addNewCommandUIpage(common), panel);
              break;

            case "webview-ready":
              hideStatusBarLoading();
              break;
            //===========> service next 
            case 'createCommand':
              const result = createNewCommand(response, common);
              if (result) {
                fullBackup();
                allowUIReload(2); // logic wich allow two diffrent screen to alow new render not take cache
              }
              break;
            case 'createBulkCommands':
              const BulkedResult = createBulkCommand(response, common);
              if (BulkedResult) {
                fullBackup();
                setCachedUI("home", HomePageUI(common));
                loadOrRenderCacheUI("home", () => HomePageUI(common), panel);
              }
              break;
            case "alert":
              vscode.window.showInformationMessage(response.data);
              break;
            case 'createTerminal':
              const errorOnStart = startTerminal(response, common);
              fullBackup({ KEY_STATE });
              setCachedUI("home", HomePageUI(common));
              loadOrRenderCacheUI("home", () => HomePageUI(common), panel);
              if (errorOnStart.length) {
                panel.webview.html = reStartView(errorOnStart);
              }
              break;
            case 'restartTerminal':
              reStartTerminal(response, common);
              if (response?.isFromResolveUi) {
                loadOrRenderCacheUI("home", () => HomePageUI(common), panel);
              }
              //loadOrRenderCacheUI("home", () => HomePageUI(common), panel);
              break;
            case 'deleteActions':
              deleteActions(response, common, () => {

                fullBackup({ all: true });
                setCachedUI("home", HomePageUI(common));
                loadOrRenderCacheUI("home", () => HomePageUI(common), panel);
              });
              break;
            case 'stopActions':
              stopTerminal(response, common);
              break;
            case 'allowStartup':
              const {
                projectID,
                selected, stateOfCheckBOx } = response.data || {};


              const getStartup = common.getStartup();
              const statePresent = getStartup[projectID];
              if (statePresent) {
                statePresent.autoStart = selected;
                //statePresent.projectWorkspace = selected ? projectDirectory : ""
              } else {
                getStartup[projectID] = {
                  autoStart: selected,
                  // projectWorkspace: selected ? projectDirectory : false
                }
              }
              saveCheckBoxStateByWorkspace(stateOfCheckBOx, common);
              fullBackup({ KEY_STARTUP, KEY_STATE });
              setCachedUI("home", HomePageUI(common));
              vscode.window.showInformationMessage("Status Changed");
              break;
            case 'setDirectory': {
              const {
                projectID,
                selected } = response.data || {};

              const getStartup = common.getStartup();
              const statePresent = getStartup[projectID];
              if (statePresent) {
                //statePresent.autoStart = selected;
                statePresent.projectWorkspace = selected ? projectDirectory : false
              } else {
                getStartup[projectID] = {
                  //autoStart: selected,
                  projectWorkspace: selected ? projectDirectory : false
                }
              }

              fullBackup({ KEY_STARTUP });
              setCachedUI("home", HomePageUI(common));
              vscode.window.showInformationMessage("Status Changed");
            }
              break;

          }
        },
        undefined,
        context.subscriptions
      );
      // Handle the webview being closed
      panel.onDidDispose(() => {
        panel = undefined; // Clear the reference when closed
      });
    }
  });


  // Create a status bar item with an icon
  statusBarIcon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarIcon.command = 'LaunchBoard';
  statusBarIcon.text = `$(zap) ${fancyProjectName}`;  // $(zap) is an icon from the Octicons set
  statusBarIcon.tooltip = `Open ${fancyProjectName}`;
  statusBarIcon.show();



  context.subscriptions.push(Screen);
  context.subscriptions.push(statusBarIcon);
  // setting initial UI home page -> loading before screen is loaded so ui can be fast 
  // currenty due to the vs code internal implementaion the UI is by defaule 1second delay even how fast 
  // our own application extension was
  loadOrRenderCacheUI("home", () => HomePageUI(common), undefined);
  starupLogic(common);


  //startTerminal({ data: common.checkBoxState() }, common);

}

// This method is called when your extension is deactivated
function deactivate() {
}

module.exports = {
  activate,
  deactivate,
};
