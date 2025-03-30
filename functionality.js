
function createNewCommand(response, common) {
    const { name, command, projectName } = response?.data || {};
    const project = common.projectNames();

    if (project?.[projectName]) {
        console.log("present this project")
        return false;
    } else {
        const indexNumber = common.count();
        project[projectName] = {
            project: `'${projectName}'`,
            index: indexNumber
        }
        return true;
    }

    // const uuid = uuidv4();
    if (response?.data?.name && response.data.command && !(response?.data?.name in commandStore)) {
        commandStore[response.data.name] = {
            id: response.data.name,
            name: response.data.name,
            command: response.data.command,
            checked: false,
        }
        vscode.window.showInformationMessage('New Action command is created');
        return true
    } else {
        vscode.window.showInformationMessage("Action name required or already exists.");
        return false
    }
}

function createBulkCommand(commandStore, message, vscode) {
    const { data: BulkarrayOfJsonData } = message || {};
    const messageMKR = [false, false, 'Action created!', 'some', 'Actions skipped due to missing or duplicate names'];
    BulkarrayOfJsonData?.forEach(({ name, command, checked = false } = {}) => {
        if (name && command && !(name in commandStore)) {
            commandStore[name] = {
                id: name,
                name: name,
                command: command,
                checked: checked,
            }

            messageMKR[0] = true;
        } else {
            messageMKR[1] = true;
        }
    })
    vscode.window.showInformationMessage(`${messageMKR[0] ? messageMKR[2] : ""} ${messageMKR[0] && messageMKR[1] ? messageMKR[3] : ""} ${messageMKR[1] ? messageMKR[4] : ""}`);
    return messageMKR[0];
}



function createNewTerminal(vscode, task, activeTerminals, TERMINAL_IdMap) {
    if (!task?.name) {
        vscode.window.showInformationMessage(`Action need proper name`);
        return;
    }
    // Check if a terminal with the same name is already running
    if (activeTerminals[task?.name]) {
        vscode.window.showInformationMessage(`${task.name} is already running.`);
        return true; // retrun true on errror
    }

    // Retrieve the root directory of the current workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;

    // Create the terminal with the specified working directory if available
    const terminal = vscode.window.createTerminal({
        name: task?.name,
        cwd: workspacePath // Set the working directory if the workspace exists
    });

    // Store the terminal instance in activeTerminals using the task name
    TERMINAL_IdMap.set(terminal, { terminal, name: task.name });
    activeTerminals[task.name] = { terminal, name: task.name, command: task?.command };

    // Show the terminal and run the specified command
    terminal.show();
    terminal.sendText(task?.command);

    return false;
}

function startTerminal(vscode, Actiondata, commandStore, activeTerminals, TERMINAL_IdMap) {
    const commandThatCannotAbleToStart = [];
    const { data: actions } = Actiondata;
    //actions here means these are terminal name wich is checked  on ui and need to start it ,
    //so based on that we seting true or false on our commandStore object
    Object.values(commandStore || {}).forEach(
        singleActionObject => {

            if (actions[singleActionObject.id]) {
                singleActionObject.checked = true;
                const result = createNewTerminal(vscode, singleActionObject, activeTerminals, TERMINAL_IdMap);
                if (result) {
                    commandThatCannotAbleToStart.push(singleActionObject);//name
                }
            } else {
                singleActionObject.checked = false;
            }
        }
    );

    return commandThatCannotAbleToStart;
}

function reStartTerminal(vscode, Actiondata, commandStore, activeTerminals, TERMINAL_IdMap) {
    const { data: reStartIssues } = Actiondata;
    //actions here means these are terminal name wich is checked  on ui and need to start it ,
    //so based on that we seting true or false on our commandStore object
    reStartIssues?.forEach((nameasId) => {
        const commandsData = commandStore[nameasId]
        if (commandsData) {
            const { terminal } = activeTerminals[nameasId] || {}
            if (terminal) {
                // Close the terminal
                terminal.dispose();
                delete activeTerminals[nameasId];
                TERMINAL_IdMap.delete(terminal);
                createNewTerminal(vscode, commandsData, activeTerminals, TERMINAL_IdMap);
            } else {
                createNewTerminal(vscode, commandsData, activeTerminals, TERMINAL_IdMap);
            }
        }

    })

}


function stopTerminal(vscode, Actiondata, commandStore, activeTerminals, TERMINAL_IdMap) {
    const { data: stopTerminalName } = Actiondata;
    //actions here means these are terminal name wich is checked  on ui and need to start it ,
    //so based on that we seting true or false on our commandStore object
    stopTerminalName?.forEach((nameasId) => {
        const { terminal } = activeTerminals[nameasId] || {}
        if (terminal) {
            // Close the terminal
            terminal.dispose();
            TERMINAL_IdMap.delete(terminal);
            delete activeTerminals[nameasId];
        }
    })

}


function deleteActions(vscode, commands, commandStore, callBack, activeTerminals, TERMINAL_IdMap) {

    vscode.window.showInformationMessage(
        "Do you want Delete selected Actions",
        { modal: true }, // Makes it a modal dialog
        "Yes",
        "No"
    ).then((userChoice) => {
        if (userChoice === "Yes") {
            commands.data?.forEach(id => {
                const { terminal } = activeTerminals[id] || {};
                if (terminal) {
                    TERMINAL_IdMap.delete(terminal);
                    delete activeTerminals[id];
                }

                delete commandStore[id];
            });
            vscode.window.showInformationMessage("Actions Deleted");
            callBack();
        }
    });
}




module.exports = {
    createNewCommand,
    startTerminal,
    deleteActions, createBulkCommand,
    reStartTerminal, stopTerminal
}