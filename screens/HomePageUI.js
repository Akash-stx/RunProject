function HomePageUI({ commandStore, fancyProjectName, checkBoxState, eachProjectLocator } = {}) {


    const actions = commandStore(); //load all data like project name and its comment like that
    const checkedState = checkBoxState(); // load the data like wich is checkbox seleected wich is not
    const projectLocater = eachProjectLocator();

    const toExport = JSON.stringify(actions);

    const UICreator = {
        checkBoxData: [],
        projectIds: [],
    };

    UICreator.checkBoxData.push("{");

    const checkboxesHtml = projectLocater?.length
        ? projectLocater.map((locaterData) => {
            const project = actions[locaterData.projectId];
            const checkbox = Object.values(project?.datas || {});
            if (!project && !checkbox.length) {
                return "";
            }


            const state = checkedState[project.projectId];

            UICreator.checkBoxData.push(project.projectId);
            UICreator.checkBoxData.push(":");

            const checkboxSize = checkbox.length;
            let howmanychecked = 0;
            let collectSelectedCheckBoxId = [];

            const innerCheckBox = checkbox.map((command) => {
                const isChecked = state?.checkedCheckBoxId[command.id];
                if (isChecked) {
                    collectSelectedCheckBoxId.push(`${command.id}:true`);
                    howmanychecked++;
                }

                return `<label class="command-item" style="display: block; margin-top: 5px;">
                    <input type="checkbox" class="command-checkbox" data-project="${project.projectId}" data-id="${command.id}" id="${command.id}" ${isChecked ? "checked" : ""}>
                    ${command.commandDescription} (${command.actualCommand})
                </label>`
            }).join('');

            UICreator.checkBoxData.push(`{project:${project.projectId} , total:${checkboxSize}, current:${howmanychecked} , checkedCheckBoxId:{${collectSelectedCheckBoxId.join()}} },`);
            return `<div class="project" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
            <div class="project-header" style="font-size: 1.1em; font-weight: bold; margin-bottom: 10px;">
                <label>
                  <input type="checkbox" id="${project.projectId}" class="project-checkbox" data-project="${project.projectId}" ${checkboxSize === howmanychecked ? "checked" : ""}>
                  ${project.projectName}
                </label>
            </div>
            <div class="commands" style="margin-left: 20px;">
                ${innerCheckBox}
            </div>
        </div>`
        }).join('')
        : "<p id='noActionPresent'>No Actions Present</p>";


    UICreator.checkBoxData.push("}");
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Checkboxes with Actions</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                //font-family: cursive;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            h1 {
                color: #333;
            }
            #actionsContainer {
                width: 100%;
                overflow-y: auto;
                max-height: calc(100vh - 80px);
                padding-bottom: 60px;
            }
            .project {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: #f9f9f9;
            }
            .project-header {
                font-size: 1.1em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .commands {
                margin-left: 20px;
            }
            h1{
                font-family: cursive;
            }
            label {
                display: flex;
                align-items: center;
                cursor: pointer;
                color: #555;
            }
            input[type="checkbox"] {
                margin-right: 10px;
                transform: scale(1.2);
            }
            .button-container {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background: #fff;
                box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
                padding: 10px;
                display: flex;
                justify-content: center;
                z-index: 10;
            }
            button {
                padding: 5px 10px;
                border: none;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-size: 14px;
                margin: 0 5px;
                transition: background-color 0.3s, transform 0.2s;
            }
            #exportData {
            position: absolute; /* Position it off-screen */
            left: -9999px; /* Move it off the visible area */
            width: 1px; /* Minimal width */
            height: 1px; /* Minimal height */
            opacity: 0; /* Fully transparent */
            }
            #runButton { background-color: #28a745; }
            #runButton:hover { background-color: #218838; transform: translateY(-1px); }
            #restartButton { background-color: #dc3545; }
            #restartButton:hover { background-color: #c82333; transform: translateY(-1px); }
            #stopButton { background-color: #dc3545; }
            #stopButton:hover { background-color: #c82333; transform: translateY(-1px); }
            #deleteButton { background-color: #dc3545; }
            #deleteButton:hover { background-color: #c82333; transform: translateY(-1px); }
            #exportButton { background-color: #009688; }
            #exportButton:hover { background-color: #00796b; transform: translateY(-1px); }
            #createNewAction { background-color: #007bff; }
            #createNewAction:hover { background-color: #0069d9; transform: translateY(-1px); }
        </style>
    </head>
    <body>
        <h1>${fancyProjectName}</h1>
        <textarea id="exportData">${toExport}</textarea>
         
        <div id="actionsContainer">${checkboxesHtml}</div>
        <div class="button-container">
            <button id="runButton">Run Selected</button>
            <button id="restartButton">Restart Selected</button>
            <button id="stopButton">Stop Selected</button>
            <button id="deleteButton">Delete Selected</button>
            <button id="exportButton">Copy All Selected as JSON</button>
            <button id="createNewAction">Create New Action</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const stateOfCheckBOx=${UICreator.checkBoxData.join("")};
            
            // Handle button clicks
            document.getElementById('runButton').addEventListener('click', function() {
                // const result={};
                // const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'));

                //   checkedItems.forEach(input => {
                //    result[input.id]=input.id;
                //    });

                //   if (checkedItems?.length) {
                    vscode.postMessage({
                        callMethod: 'createTerminal',
                        data: stateOfCheckBOx
                    });
                // }
                
            });


            document.getElementById("actionsContainer").addEventListener("change", function(event) {
            debugger;
            
                const target = event.target;
                if (target.classList.contains("project-checkbox")) {
                    const projectName = target.dataset.project;
                    const isChecked = target.checked;
                    document.querySelectorAll(".command-checkbox[data-project='" + projectName + "']").forEach(cmdCheckbox => {
                        const checkBoxId = cmdCheckbox.dataset.id;
                        stateOfCheckBOx[projectName].checkedCheckBoxId[checkBoxId] = isChecked;
                        cmdCheckbox.checked = isChecked;
                    });

                    if(isChecked){
                      stateOfCheckBOx[projectName].current = stateOfCheckBOx[projectName].total;
                    }else{
                     stateOfCheckBOx[projectName].current = 0;
                    }

                }else if(target.classList.contains("command-checkbox")){
                     const projectName = target.dataset.project;
                     const checkBoxId = target.dataset.id;
                     const element  = document.getElementById(projectName);
                     const isChecked = target.checked;
                     stateOfCheckBOx[projectName].checkedCheckBoxId[checkBoxId] = isChecked;
                     if(isChecked){
                        stateOfCheckBOx[projectName].current++;
                        if(stateOfCheckBOx[projectName].current ===  stateOfCheckBOx[projectName].total){
                         element.checked= true;
                        }
                     }else{
                      stateOfCheckBOx[projectName].current--;

                        if(element.checked){
                         element.checked= false;
                        }
                     }
                     
                }
                      console.log(stateOfCheckBOx);
            });

            document.getElementById('exportButton').addEventListener('click', () => {
                const exportData = document.getElementById('exportData');
                exportData.select(); // Selects the content inside the textarea
                document.execCommand('copy'); // Copies the selected text to clipboard

                 
                 vscode.postMessage({
                            callMethod: 'alert',
                            data: "Data copied to clipboard!"
                        });
            });



            document.getElementById('deleteButton').addEventListener('click', function() {
                // const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))

                    vscode.postMessage({
                        callMethod: 'deleteActions',
                        data: stateOfCheckBOx
                    });
                
            });


            document.getElementById('stopButton').addEventListener('click', function() {
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
                    .map(input => input.id);

                if (checkedItems?.length) {
                    vscode.postMessage({
                        callMethod: 'stopActions',
                        data: checkedItems
                    });
                }
            });


            document.getElementById('restartButton').addEventListener('click', function() {
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
                    .map(input => input.id);

                if (checkedItems?.length) {
                    vscode.postMessage({
                        callMethod: 'restartTerminal',
                        data: checkedItems
                    });
                }
            });
            
            

            document.getElementById('createNewAction').addEventListener('click', function() {
                vscode.postMessage({
                    callMethod: 'addNewCommandUI',
                    data: null
                });
            });
        </script>
    </body>
    </html>`;
}

module.exports = HomePageUI;
