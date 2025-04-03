function HomePageUI({ commandStore, fancyProjectName, checkBoxState, eachProjectLocator, getIsStartupSelected } = {}) {


    const actions = commandStore(); //load all data like project name and its comment like that
    const checkedState = checkBoxState(); // load the data like wich is checkbox seleected wich is not
    const projectLocater = eachProjectLocator();

    const autostartEnabled = getIsStartupSelected();

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
                <label id="projectHeader">
                  <input type="checkbox" id="${project.projectId}" class="project-checkbox" data-project="${project.projectId}" ${checkboxSize === howmanychecked ? "checked" : ""}>
                  ${project.projectName}
                </label>
            </div>
            <div class="commands" style="margin-left: 20px;">
                ${innerCheckBox}
            </div>
        </div>`
        }).join('')
        : "<p id='noActionPresent'>Looks empty! Click 'Add' to create one.</p>";


    UICreator.checkBoxData.push("}");
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Checkboxes with Actions</title>
        <style>
            body {
                    font-family: 'Consolas', 'Roboto Mono', 'Ubuntu Mono', 'Courier New', monospace;
                    line-height: 1.5;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden; /* Prevents entire page from scrolling */
            }
            
            #actionsContainer {
                flex: 1;
                width: 100%;
                overflow-y: auto;
                margin-top: 98px; /* Adjust based on heading height */
                padding-bottom: 80px; /* Ensures space above button-container */
            }

            #noActionPresent {

                font-weight: bold;
                font-family: 'Consolas', 'Roboto Mono', 'Ubuntu Mono', 'Courier New', monospace;
                font-size: 15px; /* Adjust size as needed */
                line-height: 1.5; /* Improve readability */
                text-align: center;
                color:rgb(153, 38, 55);
                background: #f6f6f5;
                padding: 10px;
                border-radius: 6px;
                border: 2px solid #ccc;
                margin: 10px 0;
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
            #projectHeader {
                font-weight: bold; 
                font-family: 'Consolas', 'Roboto Mono', 'Ubuntu Mono', 'Courier New', monospace;
                font-size: 15px; /* Adjust size as needed */
                line-height: 1.5; /* Improve readability */
                font-style: italic;
                color: #4a90e2;
                padding-bottom: 5px;
            }

            .command-item {
                font-family: 'Consolas', 'Roboto Mono', 'Ubuntu Mono', 'Courier New', monospace;
                font-size: 14px; /* Adjust size as needed */
                line-height: 1.5; /* Improve readability */
                font-weight: 500;
            }


            #nameOfProject {
                    position: fixed;
                    top: -26px;
                    width: 100%;
                    background: white;
                    text-align: center;
                    padding: 10px 0;
                    font-size: 44px;
                    font-weight: 600;
                    color: #4a90e2;
                    border-bottom: 2px solid black;
                    z-index: 10;
            }

            @media (max-width: 600px) {
                #nameOfProject {
                    font-size: 24px;
                    margin: 20px 0;
                }
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

              .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 24px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .slider {
                background-color: #4CAF50;
            }

            input:checked + .slider:before {
                transform: translateX(26px);
            }


            .tooltip-container {
                padding-left: 10px;
                border: #fafaf8;
                border-width: medium;
                border-style: solid;
            }

            .tooltip {
                position: relative;
                top: 3px;
                font-weight: 600;
                color: black;
                margin-right: 10px;
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
        <h1 id="nameOfProject">${fancyProjectName}</h1>

        <textarea id="exportData">${toExport}</textarea>
         
        <div id="actionsContainer">${checkboxesHtml}</div>
        <div class="button-container">
            <button id="runButton">Run Selected</button>
            <button id="restartButton">Restart Selected</button>
            <button id="stopButton">Stop Selected</button>
            <button id="deleteButton">Delete Selected</button>
            <button id="exportButton">Copy as JSON</button>
            <button id="createNewAction">Add</button>
            
           <div class="tooltip-container">
            <label class="switch">
                <input type="checkbox" id="startupToggle"  ${autostartEnabled ? "checked" : ""}>
                <span class="slider"></span>
            </label>
            <span class="tooltip" id="tooltipText" > ${autostartEnabled ? "Auto-Start: Enabled!" : "Auto-Start: Disabled"}</span>
            </div>
            
            
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const stateOfCheckBOx=${UICreator.checkBoxData.join("")};

            const toggle = document.getElementById("startupToggle");
            const tooltipText = document.getElementById("tooltipText");

            toggle.addEventListener("change", function() {
            
                vscode.postMessage({
                        callMethod: 'allowStartup',
                        data: this.checked
                    });

                    if(this.checked){
                     tooltipText.textContent ="Auto-Start: Enabled!";
                    }else{
                     tooltipText.textContent ="Auto-Start: Disabled";
                    }
            });
            
            
            document.getElementById('runButton').addEventListener('click', function() {

                    vscode.postMessage({
                        callMethod: 'createTerminal',
                        data: stateOfCheckBOx
                    });
                
            });


            document.getElementById("actionsContainer").addEventListener("change", function(event) {
            
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
                    
            });

            document.getElementById('exportButton').addEventListener('click', () => {
                const exportData = document.getElementById('exportData');
                exportData.select(); 
                document.execCommand('copy');

                 
                 vscode.postMessage({
                       callMethod: 'alert',
                       data: "Data copied to clipboard!"
                  });

            });



            document.getElementById('deleteButton').addEventListener('click', function() {
               
                    vscode.postMessage({
                        callMethod: 'deleteActions',
                        data: stateOfCheckBOx
                    });
                
            });


            document.getElementById('stopButton').addEventListener('click', function() {

                    vscode.postMessage({
                        callMethod: 'stopActions',
                        data: stateOfCheckBOx
                    });
                
            });


            document.getElementById('restartButton').addEventListener('click', function() {

                    vscode.postMessage({
                        callMethod: 'restartTerminal',
                        data: stateOfCheckBOx
                    });
                
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
