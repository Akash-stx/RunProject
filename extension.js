// The module 'vscode' contains the VS Code extensibility API


const createNewCommandPage = require("./screens/CreateNewCommandPage");
const { createNewCommand, startTerminal, deleteActions, createBulkCommand, reStartTerminal, stopTerminal } = require("./functionality");


const CheckBox = require("./screens/CheckBox");
const reStartView = require("./screens/Resolve");
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * this is store of all the taken imports
 */
const persisitKey = 'runProject.dev.akash';

let commandStore = [];
const activeTerminals = {};
const TERMINAL_IdMap = new Map();
const projectIDKeep = new Map();




/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  //accesing persistance store
  debugger
  commandStore = context.globalState.get(persisitKey) || [];


  function persistStore(key, data) {
    context.globalState.update(key, data);
  }


  //#EVENTS



  // Handle terminal close event
  vscode.window.onDidCloseTerminal(Terminal => {
    const { terminal, name } = TERMINAL_IdMap.get(Terminal);// getting by refrrnece way no other way is easy // other way is hard , or i  dnont have time for it
    if (terminal && name) {
      TERMINAL_IdMap.delete(Terminal);
      delete activeTerminals[name];
      vscode.window.showInformationMessage(`${name} has been closed.`);
    }
  });


  let panel;

  const Screen = vscode.commands.registerCommand('Run.ProjectUI', () => {
    // Check if the webview panel is already open
    if (panel) {
      //1) way one
      // If it is, reveal it (bring it to front)
      //panel.reveal(vscode.ViewColumn.One); 

      //2) way two
      panel.dispose();
      panel = null; // Reset the panel variable so it can be recreated next time
    } else {
      panel = vscode.window.createWebviewPanel(
        'RunProject',
        'Import Plus',
        vscode.ViewColumn.One,
        {
          enableScripts: true
        }
      );

      // When the panel is closed, reset the panel variable
      panel.onDidDispose(() => {
        panel = null;
      });
      // panel.webview.html = createNewCommandPage();
      panel.webview.html = CheckBox(commandStore);
      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        (message) => {

          switch (message.command) {
            case 'createCommand':
              const result = createNewCommand(commandStore, message, vscode);
              if (result) {
                persistStore('persistedCommand', commandStore);
              }
              break;
            case 'createBulkCommands':
              const BulkedResult = createBulkCommand(commandStore, message, vscode);
              if (BulkedResult) {
                persistStore('persistedCommand', commandStore);
              }
              break;
            case "alert":
              vscode.window.showInformationMessage(message.data);
              break;
            case 'showList':
              panel.webview.html = CheckBox(commandStore);
              break;
            case 'openCreateAction':
              panel.webview.html = createNewCommandPage();
              break;
            case 'createTerminal':
              const errorOnStart = startTerminal(vscode, message, commandStore, activeTerminals, TERMINAL_IdMap);
              if (errorOnStart.length) {
                panel.webview.html = reStartView(errorOnStart);
              } else {
                panel.webview.html = CheckBox(commandStore);
              }
              persistStore('persistedCommand', commandStore);
              break;
            case 'restartTerminal':
              reStartTerminal(vscode, message, commandStore, activeTerminals, TERMINAL_IdMap);
              panel.webview.html = CheckBox(commandStore);
              break;
            case 'deleteActions':
              deleteActions(vscode, message, commandStore, () => {
                persistStore('persistedCommand', commandStore);
                panel.webview.html = CheckBox(commandStore);
              }, activeTerminals, TERMINAL_IdMap);
              break;
            case 'stopActions':
              stopTerminal(vscode, message, commandStore, activeTerminals, TERMINAL_IdMap);
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
  statusBarIcon.text = `$(zap) Run Project`;  // $(zap) is an icon from the Octicons set
  statusBarIcon.tooltip = 'Open Run Project';
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
