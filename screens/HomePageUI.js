const innerCss = require("./homePageCss");

function HomePageUI({ commandStore, fancyProjectName, checkBoxState,
    eachProjectLocator, getStartup, projectDirectory } = {}) {

    const emptyList_Message = "<p id='noActionPresent'>No projects found. Click 'Add' to create a new one.</p>";


    //load all data like project name and its comment like that
    const actions = commandStore();
    // load the data like wich is checkbox seleected wich is not
    const checkedState = checkBoxState();
    const projectLocater = eachProjectLocator();

    const startupData = getStartup();

    const toExport = JSON.stringify(actions);

    const UICreator = {
        checkBoxData: [],
        projectIds: [],
    };

    UICreator.checkBoxData.push("{");
    const projectDirectoryFirst = [];
    const OtherDirectorylast = [];

    projectLocater?.length && projectLocater.forEach((locaterData) => {
        const project = actions[locaterData.projectId];
        //const checkbox = Object.values(project?.datas || {});
        const checkbox = locaterData?.children || [];

        if (!project && !checkbox.length) {
            return "";
        }

        const isThisProjectDirectory = projectDirectory === startupData?.[project.projectId]?.["projectWorkspace"];

        const state = checkedState[project.projectId];

        const autoStart = startupData?.[project.projectId]?.["autoStart"] || false;


        UICreator.checkBoxData.push(project.projectId);
        UICreator.checkBoxData.push(":");

        const checkboxSize = checkbox.length;
        let howmanychecked = 0;
        let collectSelectedCheckBoxId = [];


        const innerCheckBox = checkbox.map((CommandIdByLocater) => {
            const command = project?.datas?.[CommandIdByLocater];
            const isChecked = state?.checkedCheckBoxId?.[command.id]; //map 
            if (isChecked) {
                collectSelectedCheckBoxId.push(`${command.id}:true`);
                howmanychecked++;
            }

            return `<label class="command-item">

                    <input type="checkbox" style="cursor: grab;" class="command-checkbox" data-project="${project.projectId}" data-id="${command.id}" id="${command.id}" ${isChecked ? "checked" : ""}>
                    ${command.commandDescription} (${command.actualCommand})

                </label>`
        }).join('');

        UICreator.checkBoxData.push(`{project:${project.projectId} , autoStart: ${autoStart} , total:${checkboxSize}, current:${howmanychecked} , checkedCheckBoxId:{${collectSelectedCheckBoxId.join()}} },`);


        const UI = `<div class="project">
           
               <div class="project-header  ${isThisProjectDirectory ? '' : 'locked'}" id="ph-${project.projectId}">
                
                     <span class="${isThisProjectDirectory ? "mark-workspace" : "not-mark-workspace"}" id="mw-${project.projectId}" >Current Workspace</span>
        
                    <label id="projectHeader">
                    <input type="checkbox" style="cursor: grab;" id="${project.projectId}" class="project-checkbox" data-project="${project.projectId}" ${checkboxSize === howmanychecked ? "checked" : ""}>
                    ${project.projectName}
                    </label>

                </div>
                
                <div class="commands ${isThisProjectDirectory ? '' : 'locked'}" id="pc-${project.projectId}" >
                    ${innerCheckBox}
                </div>
            
                <!-- Drop Icon Button -->

                <button
                    class="toggle-details-btn" id="toggle-details-btn-id"
                    data-project="${project.projectId}" 
                    style="background: none; border: none;  cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <span class="toggle-icon">▼</span> <span>Project settings</span>
                </button>

           
                <!-- Collapsible Content -->

                <div class="Collapsible" id="collapse-${project.projectId}" data-project="${project.projectId}" style="display: none; margin-top: 10px;">
                    
                    <div class="tooltip-container">
                        <label class="switch">
                            <input type="checkbox" style="cursor: grab;" class="tooglerSetDirectory" data-project="${project.projectId}" ${isThisProjectDirectory ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                        <span class="tooltip" >Set as Project Workspace</span>
                        <small class="toolTipHint">| (Mark this directory as the workspace source for this project.)</small>
                    </div>
                    

                  <div class="noninteractive ${isThisProjectDirectory ? '' : 'locked'}" id="pn-${project.projectId}">
 
                    <div class="tooltip-container">
                        <label class="switch">
                            <input type="checkbox" style="cursor: grab;" class="startupToggleOfproject" data-project="${project.projectId}" ${autoStart ? "checked" : ""}>
                            <span class="slider"></span>
                        </label>
                        <span class="tooltip" id="${'tooltipText-' + project.projectId}" >${autoStart ? "Automatic Project Launch: Enabled!" : "Automatic Project Launch: Disabled"}</span>
                        <small class="toolTipHint">| (Turn on Automatic Project Launch for this project when you open its workspace.)</small>
                    </div>

                  </div>



                </div>

              </div>`;

        if (isThisProjectDirectory) {
            projectDirectoryFirst.push(UI);
        } else {
            OtherDirectorylast.push(UI);
        }
        //end of function
    });

    const checkBox_Main = projectDirectoryFirst.join("");
    const checkBox_Other = OtherDirectorylast.join("");

    UICreator.checkBoxData.push("}");
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Checkboxes with Actions</title>
     ${innerCss}
    </head>
    <body>
        <h1 id="nameOfProject">${fancyProjectName}</h1>

        <textarea id="exportData">${toExport}</textarea>
        <div id="actionsContainer">${checkBox_Main}${checkBox_Other}${checkBox_Main || checkBox_Other ? "" : emptyList_Message}</div>

        <div class="button-container">
            <button id="runButton">Run Selected</button>
            <button id="restartButton">Restart Selected</button>
            <button id="stopButton">Stop Selected</button>
            <button id="deleteButton">Delete Selected</button>
            <button id="exportButton">Copy as JSON</button>
            <button id="createNewAction">Add</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const stateOfCheckBOx=${UICreator.checkBoxData.join("")};
            
            document.getElementById('runButton').addEventListener('click', function() {

                    vscode.postMessage({
                        callMethod: 'createTerminal',
                        data: stateOfCheckBOx
                    });
                
            });



            document.querySelectorAll(".toggle-details-btn").forEach(button => {
            button.addEventListener("click", () => {
                const projectId = button.getAttribute("data-project");
                const details = document.getElementById('collapse-'+projectId);

                const icon = button.querySelector(".toggle-icon");

                if (details) {
                const isOpen = details.style.display === "block";
                details.style.display = isOpen ? "none" : "block";
                 if (icon) icon.textContent = isOpen ? "▼" : "▲";
                }
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
                     
                }else if(target.classList.contains("startupToggleOfproject")){
                  const projectID = target.dataset.project;
                  console.log(projectID ,target.checked);


                             
                    vscode.postMessage({
                        callMethod: 'allowStartup',
                        data: {
                         selected:target.checked,
                         projectID,
                         stateOfCheckBOx
                        }
                    });

                    const tooltipText = document.getElementById('tooltipText-'+projectID);

                    if(target.checked){
                     tooltipText.textContent ="Automatic Project Launch: Enabled!";
                    }else{
                     tooltipText.textContent ="Automatic Project Launch: Disabled";
                    }
                }else if(target.classList.contains("tooglerSetDirectory")){
                   const projectID = target.dataset.project;
                   console.log(projectID ,target.checked);

                   const projectHeadingDiv = document.getElementById('ph-'+projectID);
                   const markWorkspaceSpan = document.getElementById('mw-'+projectID);
                   const projectCommandDiv = document.getElementById('pc-'+projectID);
                   const projectNonInteractiveDiv = document.getElementById('pn-'+projectID);


                   if(target.checked){
                     projectHeadingDiv.classList.remove('locked');
                     projectCommandDiv.classList.remove('locked');
                     projectNonInteractiveDiv.classList.remove('locked');
                     markWorkspaceSpan.classList.remove('not-mark-workspace');
                     markWorkspaceSpan.classList.add('mark-workspace');

                     vscode.postMessage({
                        callMethod: 'setDirectory',
                        data: {
                         selected:true,
                         projectID
                        }
                    });
                   }else{

                     projectHeadingDiv.classList.add('locked');
                     projectCommandDiv.classList.add('locked');
                     projectNonInteractiveDiv.classList.add('locked');
                     markWorkspaceSpan.classList.remove('mark-workspace');
                     markWorkspaceSpan.classList.add('not-mark-workspace');

                    vscode.postMessage({
                        callMethod: 'setDirectory',
                        data: {
                         selected:false,
                         projectID
                        }
                    });
                   }


                   // Remove 'locked', add 'unlocked'

                
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
            vscode.postMessage({ callMethod: 'webview-ready' });
        </script>
    </body>
    </html>`;
}

module.exports = HomePageUI;
