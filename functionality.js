
function createNewCommand(response, common) {
    const { name, command, projectName } = response?.data || {};
    const eachProjectLocator = common.eachProjectLocator();//load all project name and its saved index on commandStore
    const mainCommandObject = common.commandStore();

    const currentProjectFromArray = eachProjectLocator.find((project) => project.projectName === projectName);

    if (currentProjectFromArray) { // already this project is present 
        const project = mainCommandObject[currentProjectFromArray.projectId];
        const commandID = common.count();
        project.datas[commandID] = { id: commandID, projectId: commandID.projectId, commandDescription: name, actualCommand: command };

    } else {
        const projectId = common.count();
        const savedIndex = eachProjectLocator.push({
            projectId: projectId,
            projectName: projectName,
            projectNameSmallCase: projectName.toLowerCase(),
            searchBox: `'${projectName}'`
        });

        const commandID = common.count();
        mainCommandObject[projectId] = {
            projectId: projectId,
            projectName: projectName,
            projectLocatIndex: savedIndex - 1,
            datas: {
                [commandID]: { id: commandID, projectId, commandDescription: name, actualCommand: command }
            },
        };


    }
    common.vscode.window.showInformationMessage('New command is created');
    return true;
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



function createNewTerminal(data, common) {
    //{ id: commandID, commandDescription: name, actualCommand: command }
    const activityTerminal = common.activeTerminals();
    const TERMINAL_IdMap = common.TERMINAL_IdMap();


    if (!data?.id) {
        common.vscode.window.showInformationMessage(`Action need proper name`);
        return;
    }
    // Check if a terminal with the same name is already running
    if (activityTerminal[data.id]) {
        common.vscode.window.showInformationMessage(`${data.commandDescription} is already running.`);
        return true; // retrun true on errror
    }

    // Retrieve the root directory of the current workspace
    const workspaceFolders = common.vscode.workspace.workspaceFolders;
    const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;

    // Create the terminal with the specified working directory if available
    const terminal = common.vscode.window.createTerminal({
        name: data.commandDescription,
        cwd: workspacePath // Set the working directory if the workspace exists
    });

    // Store the terminal instance in activeTerminals using the data name
    TERMINAL_IdMap.set(terminal, { terminal, name: data.commandDescription, projectId: data.projectId });
    activityTerminal[data.id] = { terminal, id: data.id, projectId: data.projectId, name: data.commandDescription, command: data.actualCommand };

    // Show the terminal and run the specified command
    terminal.show();
    terminal.sendText(data.actualCommand);

    return false;
}

function startTerminal(response, common) {
    const { vscode, activeTerminals, TERMINAL_IdMap } = common;
    const commandStore = common.commandStore();
    const eachProjectIndex = common.eachProjectLocator();

    const commandThatCannotAbleToStart = [];
    const { data: stateOfCheckBOx } = response;
    //actions here means these are terminal name wich is checked  on ui and need to start it ,
    //so based on that we seting true or false on our commandStore object

    Object.values(stateOfCheckBOx || {}).forEach(
        ({ checkedCheckBoxId, project: projectId } = {}) => {
            const projectObject = commandStore[projectId];
            Object.entries(checkedCheckBoxId)?.forEach(([keys, value]) => {
                if (value) {
                    const data = projectObject?.datas?.[keys];
                    if (data) {
                        const result = createNewTerminal({ ...data, projectId }, common);
                        if (result) {
                            commandThatCannotAbleToStart.push(data);
                        }
                    }

                }

            });

            // if (actions[singleActionObject.id]) {
            //     singleActionObject.checked = true;
            //     const result = createNewTerminal(vscode, singleActionObject, activeTerminals, TERMINAL_IdMap);
            //     if (result) {
            //         commandThatCannotAbleToStart.push(singleActionObject);//name
            //     }
            // } else {
            //     singleActionObject.checked = false;
            // }
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


function deleteActions(response, common, callBack) {



    //vscode, commands, commandStore, callBack, activeTerminals, TERMINAL_IdMap

    common.vscode.window.showInformationMessage(
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
            common.vscode.window.showInformationMessage("Deleted succesfully");
            callBack();
        }
    });
}




module.exports = {
    createNewCommand,
    startTerminal,
    deleteActions, createBulkCommand,
    reStartTerminal, stopTerminal, createNewTerminal
}