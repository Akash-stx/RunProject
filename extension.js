const addNewCommandUIpage = require("./screens/addNewCommandUIpage");
const { createNewCommand, startTerminal, deleteActions, createBulkCommand, reStartTerminal, stopTerminal } = require("./functionality");
const HomePageUI = require("./screens/HomePageUI");
const reStartView = require("./screens/Resolve");
const vscode = require("vscode");



/**
 * keys of storess
 */
const KEY_COMMANDS = 'runProject.dev.akash_c';
const KEY_STATE = 'runProject.dev.akash_s';
const KEY_PROJECTS = 'runProject.dev.akash_p';
const KEY_NUMBER = 'runProject.dev.akash_n';
/**
 * project name
 */
const fancyProjectName = 'Run Project';


/***
 * Actual object store the datas
 */
let commandStore = [];
let checkBoxState = {};
let projectNames = {};
let count = 0;
const activeTerminals = {};
const TERMINAL_IdMap = new Map();
const cacheUI = {};



function init(context) {
  commandStore = context.globalState.get(KEY_COMMANDS) || [];
  checkBoxState = context.globalState.get(KEY_STATE) || {};
  projectNames = context.globalState.get(KEY_PROJECTS) || {};
  count = context.globalState.get(KEY_NUMBER) || 0;
}

function loadOrRenderCacheUI(cacheKey, uiFunction, panel) {
  let cache = cacheUI[cacheKey];
  if (!cache) {
    cache = uiFunction?.();
    cacheUI[cacheKey] = cache;
  }
  panel.webview.html = cache;
}

function setCachedUI(cacheKey, cachedUI) {
  cacheUI[cacheKey] = cachedUI;
}


//-------------------------------------------------🍟🚒💥--------------------------------------------------

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  /**
   * initializations
   */init(context);


  function persistStore(key, data) {
    context.globalState.update(key, data);
  }




  //#EVENTS



  // Handle terminal close event
  vscode.window.onDidCloseTerminal(Terminal => {
    const { terminal, name } = TERMINAL_IdMap.get(Terminal);
    if (terminal && name) {
      TERMINAL_IdMap.delete(Terminal);
      delete activeTerminals[name];
      vscode.window.showInformationMessage(`${name} has been closed.`);
    }
  });


  let panel;

  const common = {
    checkBoxState: () => checkBoxState,
    fancyProjectName,
    projectNames: () => projectNames,
    panel: () => panel,
    vscode,
    cacheUI: () => cacheUI,
    TERMINAL_IdMap: () => TERMINAL_IdMap,
    activeTerminals: () => activeTerminals,
    count: () => count++,
    commandStore: () => commandStore,
  };


  const Screen = vscode.commands.registerCommand('Run.ProjectUI', () => {
    // Check if the webview panel is already open
    if (panel) {
      setCachedUI("home", panel?.webview?.html || undefined);
      if (panel.visible) {
        // ✅ If panel is currently visible, dispose (close) it
        panel.dispose();
        panel = null; // Reset the panel variable
      } else {
        // ✅ If panel exists but is not visible, bring it to front
        panel.reveal(vscode.ViewColumn.One);
      }
    } else {
      panel = vscode.window.createWebviewPanel(
        'RunProject',
        fancyProjectName,
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );

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


            //===========> service next 
            case 'createCommand':
              const result = createNewCommand(response, common);
              if (result) {
                //persistStore('persistedCommand', commandStore);
                setCachedUI("addNewCommand", addNewCommandUIpage(common));
              }
              break;
            case 'createBulkCommands':
              const BulkedResult = createBulkCommand(commandStore, response, vscode);
              if (BulkedResult) {
                persistStore('persistedCommand', commandStore);
              }
              break;
            case "alert":
              vscode.window.showInformationMessage(response.data);
              break;
            case 'createTerminal':
              const errorOnStart = startTerminal(vscode, response, commandStore, activeTerminals, TERMINAL_IdMap);
              if (errorOnStart.length) {
                panel.webview.html = reStartView(errorOnStart);
              } else {
                panel.webview.html = HomePageUI(commandStore);
              }
              persistStore('persistedCommand', commandStore);
              break;
            case 'restartTerminal':
              reStartTerminal(vscode, response, commandStore, activeTerminals, TERMINAL_IdMap);
              panel.webview.html = HomePageUI(commandStore);
              break;
            case 'deleteActions':
              deleteActions(vscode, response, commandStore, () => {
                persistStore('persistedCommand', commandStore);
                panel.webview.html = HomePageUI(commandStore);
              }, activeTerminals, TERMINAL_IdMap);
              break;
            case 'stopActions':
              stopTerminal(vscode, response, commandStore, activeTerminals, TERMINAL_IdMap);
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
  const statusBarIcon = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarIcon.command = 'Run.ProjectUI';
  statusBarIcon.text = `$(zap) ${fancyProjectName}`;  // $(zap) is an icon from the Octicons set
  statusBarIcon.tooltip = `Open ${fancyProjectName}`;
  statusBarIcon.show();



  context.subscriptions.push(Screen);
  context.subscriptions.push(statusBarIcon);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate,
};
