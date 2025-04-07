
function createNewCommand(response, common) {
    const { name, command, projectName, isWorkspaceToggle } = response?.data || {};
    const eachProjectLocator = common.eachProjectLocator();//load all project name and its saved index on commandStore
    const mainCommandObject = common.commandStore();
    const startupDatas = common.getStartup();
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

        eachProjectLocator.push({
            projectId: projectId,
            projectName: projectName,
            projectNameSmallCase: projectName.toLowerCase(),
            searchBox: `'${projectName}'`,
            children: [commandID]
        });

        startupDatas[projectId] = { autoStart: false, projectWorkspace: isWorkspaceToggle ? common?.projectDirectory : "" };

        mainCommandObject[projectId] = {
            projectId: projectId,
            projectName: projectName,
            datas: {
                [commandID]: { id: commandID, projectId, commandDescription: name, actualCommand: command }
            },
        };


    }
    common.vscode.window.showInformationMessage('New command is created');
    return true;

}

function createBulkCommand(response, common) {

    const { data: BulkarrayOfJsonData } = response || {};
    const eachProjectLocator = common.eachProjectLocator();//load all project name and its saved index on commandStore
    const mainCommandObject = common.commandStore();
    const startupDatas = common.getStartup();
    let anyProjectAdded = false;

    Object.values(BulkarrayOfJsonData || {})?.forEach?.(({ projectName, datas } = {}) => {
        if (!projectName) return;
        const projectCommandData = Object.values(datas || {});
        if (projectCommandData.length) {
            !anyProjectAdded && (anyProjectAdded = true);
            //search if it is present if it is then copy all refrence to the local variable
            // if not present create new refrence and asisgined to the local with pass that to main objects

            const currentProjectFromArray = eachProjectLocator.find((project) => project.projectName === projectName);

            let projectLocaterRefrence;
            let projectLocaterCommandRefrence;
            let mainProjectRefrence;
            let mainProjectCommandDataRefrence;
            let currentProjectId;

            if (currentProjectFromArray) {
                currentProjectId = currentProjectFromArray.projectId;
                mainProjectRefrence = mainCommandObject[currentProjectFromArray.projectId];
                if (mainProjectRefrence) {
                    projectLocaterCommandRefrence = currentProjectFromArray.children;
                    mainProjectCommandDataRefrence = mainProjectRefrence.datas;
                } else {

                    mainProjectCommandDataRefrence = {};

                    mainCommandObject[currentProjectFromArray.projectId] = {
                        projectId: currentProjectFromArray.projectId,
                        projectName: projectName,
                        datas: mainProjectCommandDataRefrence,
                    };

                }

            } else {
                const projectId = common.count();
                currentProjectId = projectId;
                projectLocaterCommandRefrence = [];
                projectLocaterRefrence = {
                    projectId: projectId,
                    projectName: projectName,
                    projectNameSmallCase: projectName.toLowerCase(),
                    searchBox: `'${projectName}'`,
                    children: projectLocaterCommandRefrence
                }
                eachProjectLocator.push(projectLocaterRefrence);
                startupDatas[projectId] = { autoStart: false, projectWorkspace: "" };


                mainProjectCommandDataRefrence = {};

                mainCommandObject[projectId] = {
                    projectId: projectId,
                    projectName: projectName,
                    datas: mainProjectCommandDataRefrence,
                };

            }

            projectCommandData.forEach(({ actualCommand, commandDescription } = {}) => {
                const commandID = common.count();
                projectLocaterCommandRefrence.push(commandID);
                mainProjectCommandDataRefrence[commandID] = { id: commandID, projectId: currentProjectId, commandDescription: commandDescription, actualCommand: actualCommand };

            });

        }

    });


    common.vscode.window.showInformationMessage(
        anyProjectAdded ? "Added successfully!" : "Not added! Please ensure the correct format."
    );
    return anyProjectAdded;
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
        name: `${common.fancyProjectName} → ${data.commandDescription}`,
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

    const commandThatCannotAbleToStart = [];
    const eachProjectLocator = common.eachProjectLocator();
    const commandStore = common.commandStore();
    const startupDatas = common.getStartup();
    const { data: checkBoxState } = response;
    const OldBoxState = common.checkBoxState();


    eachProjectLocator?.forEach?.((projectObject) => {
        const { projectWorkspace } = startupDatas?.[projectObject.projectId] || {};
        let checkBoxStateMap;
        if (common.projectDirectory === projectWorkspace && (checkBoxStateMap = checkBoxState[projectObject.projectId])) {
            const { checkedCheckBoxId, current, total } = checkBoxStateMap || {};
            OldBoxState[projectObject.projectId] = checkBoxStateMap;
            if (total && current > 0) {
                const { datas, projectName } = commandStore[projectObject.projectId];
                if (!datas) return; // safe return on any issue

                let allowedLoopAfter = current;
                const totallen = projectObject?.children?.length || 0;

                for (let index = 0; index < totallen; index++) {
                    const id = projectObject.children[index]; // array of chilren id 
                    if (checkedCheckBoxId[id]) { // checking that id in this map gives true if present
                        const passingData = { ...datas[id], projectName };
                        const result = createNewTerminal(passingData, common);
                        if (result) {
                            commandThatCannotAbleToStart.push(passingData);
                        }
                        allowedLoopAfter--;
                        if (allowedLoopAfter === 0) {
                            break;
                        }
                    }
                }
            }
        }

    });
    common.setCheckBoxState(OldBoxState);
    return commandThatCannotAbleToStart;

}

function saveCheckBoxStateByWorkspace(checkBoxState, common) {
    const eachProjectLocator = common.eachProjectLocator();
    const startupDatas = common.getStartup();
    const OldBoxState = common.checkBoxState();

    eachProjectLocator?.forEach?.((projectObject) => {
        const { projectWorkspace } = startupDatas?.[projectObject.projectId] || {};
        let checkBoxStateMap;
        if (projectWorkspace && common.projectDirectory === projectWorkspace && (checkBoxStateMap = checkBoxState[projectObject.projectId])) {
            OldBoxState[projectObject.projectId] = checkBoxStateMap;
        }
    });
    common.setCheckBoxState(OldBoxState);
}

function starupLogic(common) {
    const eachProjectLocator = common.eachProjectLocator();
    const commandStore = common.commandStore();
    const startupDatas = common.getStartup();
    const checkBoxState = common.checkBoxState();


    eachProjectLocator?.forEach?.((projectObject) => {
        const { autoStart, projectWorkspace } = startupDatas?.[projectObject.projectId] || {};
        let checkBoxStateMap;
        if (autoStart && common.projectDirectory === projectWorkspace && (checkBoxStateMap = checkBoxState[projectObject.projectId])) {
            const { checkedCheckBoxId, current, total } = checkBoxStateMap;
            if (total && current > 0) {
                const { datas } = commandStore[projectObject.projectId];
                let allowedLoopAfter = current;
                const totallen = projectObject?.children?.length || 0;

                for (let index = 0; index < totallen; index++) {
                    const id = projectObject.children[index]; // array of chilren id 
                    if (checkedCheckBoxId[id]) { // checking that id in this map gives true if present
                        createNewTerminal(datas[id], common);
                        allowedLoopAfter--;
                        if (allowedLoopAfter === 0) {
                            break;
                        }
                    }
                }
            }
        }

    });
}

function reStartTerminal(response, common) {
    const { data: selectedCheckbox } = response;
    const eachProjectLocator = common.eachProjectLocator();
    const commandStore = common.commandStore();
    const startupDatas = common.getStartup();
    const TERMINAL_IdMap = common.TERMINAL_IdMap();
    const activeTerminals = common.activeTerminals();

    let isRestartHappened = false;

    eachProjectLocator?.forEach?.((projectObject) => {
        const { projectWorkspace } = startupDatas?.[projectObject.projectId] || {};
        if (common.projectDirectory !== projectWorkspace) {
            return;
        }
        const { checkedCheckBoxId, current, total } = selectedCheckbox[projectObject.projectId] || {};

        if (total && current > 0) {
            const { datas } = commandStore[projectObject.projectId];
            projectObject?.children?.forEach((id) => {
                const { terminal } = activeTerminals[id] || {}
                if (checkedCheckBoxId[id]) {
                    terminal && terminal.dispose();
                    delete activeTerminals[id];
                    TERMINAL_IdMap.delete(terminal);
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
    const startupDatas = common.getStartup();
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

                const { projectWorkspace } = startupDatas?.[projectObject.projectId] || {};
                if (common.projectDirectory !== projectWorkspace) {
                    newProjectLocaterObject.push(projectObject);
                    return;
                }
                const { checkedCheckBoxId, current, total } = stateOfCheckBOx[projectObject.projectId];

                if (total === current) {
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
    deleteActions, createBulkCommand, saveCheckBoxStateByWorkspace,
    reStartTerminal, stopTerminal, createNewTerminal, starupLogic
}