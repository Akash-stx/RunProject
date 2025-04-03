
function createNewCommand(response, common) {
    const { name, command, projectName } = response?.data || {};
    const eachProjectLocator = common.eachProjectLocator();//load all project name and its saved index on commandStore
    const mainCommandObject = common.commandStore();

    const currentProjectFromArray = eachProjectLocator.find((project) => project.projectName === projectName);

    if (currentProjectFromArray) { // already this project is present 
        const project = mainCommandObject[currentProjectFromArray.projectId];
        const commandID = common.count();

        if (currentProjectFromArray.children) {
            currentProjectFromArray.children.push(commandID);
        } else {
            currentProjectFromArray.children = [commandID]
        }
        project.datas[commandID] = { id: commandID, projectId: project.projectId, commandDescription: name, actualCommand: command };

    } else {
        const projectId = common.count();
        const commandID = common.count();

        const savedIndex = eachProjectLocator.push({
            projectId: projectId,
            projectName: projectName,
            projectNameSmallCase: projectName.toLowerCase(),
            searchBox: `'${projectName}'`,
            children: [commandID]
        });


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
    TERMINAL_IdMap.set(terminal, { terminal, name: data.commandDescription, projectId: data.projectId, id: data.id });
    activityTerminal[data.id] = { terminal, id: data.id, projectId: data.projectId, name: data.commandDescription, command: data.actualCommand };

    // Show the terminal and run the specified command
    terminal.show();
    terminal.sendText(data.actualCommand);

    return false;
}

function startTerminal(response, common) {
    //const { vscode, activeTerminals, TERMINAL_IdMap } = common;
    const commandStore = common.commandStore();
    const eachProjectIndex = common.eachProjectLocator();

    const commandThatCannotAbleToStart = [];
    const { data: stateOfCheckBOx } = response;
    //actions here means these are terminal name wich is checked  on ui and need to start it ,
    //so based on that we seting true or false on our commandStore object

    Object.values(stateOfCheckBOx || {}).forEach(
        ({ checkedCheckBoxId, project: projectId, current: currentSelected } = {}) => {
            if (currentSelected < 1) {
                return;
            }
            const projectObject = commandStore[projectId];
            Object.entries(checkedCheckBoxId)?.forEach(([keys, value]) => {
                if (value) {
                    const data = projectObject?.datas?.[keys];
                    if (data) {
                        const newObject = { ...data, projectId };
                        const result = createNewTerminal(newObject, common);
                        if (result) {
                            commandThatCannotAbleToStart.push(newObject);
                        }
                    }

                }

            });

        }

    );
    common.setCheckBoxState(stateOfCheckBOx);
    return commandThatCannotAbleToStart;
}

function reStartTerminal(response, common) {
    const { data: selectedCheckbox } = response;
    const eachProjectLocator = common.eachProjectLocator();
    const commandStore = common.commandStore();

    const TERMINAL_IdMap = common.TERMINAL_IdMap();
    const activeTerminals = common.activeTerminals();

    let isRestartHappened = false;

    eachProjectLocator?.forEach?.((projectObject) => {
        const { checkedCheckBoxId, current, total } = selectedCheckbox[projectObject.projectId];

        if (total && current > 0) {
            const { datas } = commandStore[projectObject.projectId];
            projectObject?.children?.forEach((id) => {
                const { terminal } = activeTerminals[id] || {}
                if (checkedCheckBoxId[id] && terminal) {
                    terminal.dispose();
                    delete activeTerminals[id];
                    TERMINAL_IdMap.delete(terminal);
                    createNewTerminal(datas[id], common);
                } else {
                    createNewTerminal(datas[id], common);
                }

            })
        }
    });
}


function stopTerminal(response, common) {
    const { data: selectedCheckbox } = response;
    const eachProjectLocator = common.eachProjectLocator();

    const TERMINAL_IdMap = common.TERMINAL_IdMap();
    const activeTerminals = common.activeTerminals();

    let isStopHappened = false;

    eachProjectLocator?.forEach?.((projectObject) => {
        const { checkedCheckBoxId, current, total } = selectedCheckbox[projectObject.projectId];

        if (total && current > 0) {
            projectObject?.children?.forEach((id) => {
                const { terminal } = activeTerminals[id] || {}
                if (checkedCheckBoxId[id] && terminal) {
                    terminal.dispose();
                    delete activeTerminals[id];
                    TERMINAL_IdMap.delete(terminal);
                }

            })
        }
    });

}


function deleteActions(response, common, callBack) {
    const eachProjectLocator = common.eachProjectLocator();
    const commandStore = common.commandStore();
    // const activeTerminals = common.activeTerminals();
    let isDeleteHappened = false;
    const { data: stateOfCheckBOx } = response;

    common.vscode.window.showInformationMessage(
        "Do you want to delete? Make sure you have selected the correct option.",
        { modal: true }, // Makes it a modal dialog
        "Yes",
        "No"
    ).then((userChoice) => {
        if (userChoice === "Yes") {
            const newProjectLocaterObject = [];

            eachProjectLocator?.forEach?.((projectObject) => {
                const { checkedCheckBoxId, current, total } = stateOfCheckBOx[projectObject.projectId];

                if (total && total === current) {
                    //this show all checkbox is selected 
                    delete commandStore[projectObject.projectId];
                    !isDeleteHappened && (isDeleteHappened = true);
                    return;
                }

                if (total && current > 0) {
                    const newChildrenId = [];
                    const { datas } = commandStore[projectObject.projectId];
                    projectObject?.children?.forEach((id) => {
                        if (checkedCheckBoxId[id]) {
                            delete datas[id];
                            !isDeleteHappened && (isDeleteHappened = true);
                            return;
                        }
                        newChildrenId.push(id);
                    })
                    projectObject.children = newChildrenId;
                }
                newProjectLocaterObject.push(projectObject);
            });
            if (isDeleteHappened) {
                common.vscode.window.showInformationMessage("Deleted succesfully");
            } else {
                common.vscode.window.showInformationMessage("Deletion failed.");
            }
            common.setEachProjectLocator(newProjectLocaterObject);
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