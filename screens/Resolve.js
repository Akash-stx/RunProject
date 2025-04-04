function Resolve(toResolve = []) {
    const checkboxesHtml = toResolve?.length ? toResolve
        .map((project) => `
           <div class="parent">
            <div class="parent-name">${project.projectName}</div>
            <div class="items-container">
                <div class="item">
                <label>
                    <input type="checkbox" data-project="${project.projectId}" data-id="${project.id}" >
                    ${project.commandDescription}
                </label>
                </div>
            </div>
            </div>
    `).join('') : "<p id='noActionPresent' >All Good</p>";

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
                    padding: 10px;
                    scrollbar-color: #6d7c77 #cfd7c7;
            }
                h1 {
                    color: #333;
                    padding: 10px;
                }
                    
            .parent {
                margin-bottom: 20px;
                padding: 10px;
                    padding-left: 20px;
                background: #f8f8f8;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }

            .parent-name {
                    margin-left: -8px;
                font-size: 14px;
                font-weight: bold;
                color: #333;
                padding-bottom: 5px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 10px;
            }

            .items-container {
                padding-left: 10px; /* Indent items under parent */
            }

            .item {
                margin-bottom: 10px;
                padding: 3px;
                display: flex;
                align-items: center;
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
            #checkboxes {
                width: 100%; /* Full width for checkbox list */
                margin-bottom: 20px; /* Space between list and buttons */
            }
            button {
                padding: 5px 10px; /* Smaller button size */
                border: none;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-size: 14px; /* Smaller font size */
                transition: background-color 0.3s, transform 0.2s;
                margin: 0 5px; /* Add spacing between buttons */
            }
            #runButton {
                background-color: #28a745; /* Green */
            }
            #runButton:hover {
                background-color: #218838; /* Darker green */
                transform: translateY(-1px);
            }

            #viewActionList {
                background-color: #007bff; /* Blue */
            }
            #viewActionList:hover {
                background-color: #0069d9; /* Darker blue */
                transform: translateY(-1px);
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

            #noActionPresent{
             text-align: center;
             color: black;
            }
             #checkboxes  {
                margin-top: 135px;
            }

            #nameOfProject {
                    position: fixed;
                    top: -22px;
                    width: 100%;
                    background: white;
                    text-align: center;
                    padding: 10px 0;
                    font-size: 32px;
                    font-weight: 600;
                    color: #4a90e2;
                    border-bottom: 2px solid black;
                    z-index: 10;
            }

        </style>
    </head>
    <body>
        <h1 id="nameOfProject" >Manual Resolution: Check if already active and resolve.</h1>
        <div id="checkboxes">
          ${checkboxesHtml}
        </div>
        

        <div class="button-container">
            <button id="runButton">Restart Selected</button>
            <button id="viewActionList">Back</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const viewActionListButton = document.getElementById('viewActionList');

            viewActionListButton.addEventListener('click', () => {
                vscode.postMessage({
                    callMethod: 'homePage',
                    data: null
                });
            });

           
            document.getElementById('runButton').addEventListener('click', function() {
                const result={};
                let anycreated=false;
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'));

                  checkedItems.forEach((input) => {
                    const projectId = input.dataset.project;
                    const checkBoxId = input.dataset.id;
                    if(result[projectId]){
                      result[projectId].checkedCheckBoxId[checkBoxId]=true;
                      result[projectId].current=result[projectId].current+1;
                      result[projectId].total=result[projectId].total+1;
                    }else{
                        anycreated=true;
                        result[projectId]={
                            checkedCheckBoxId:{[checkBoxId]:true},
                            current:1,
                            total:1
                        }
                    }

                   });

                  if (anycreated) {
                    vscode.postMessage({
                        callMethod: 'restartTerminal',
                        data: result,
                        isFromResolveUi:true
                    });
                  }
               
            });


        </script>
    </body>
    </html>`;
}

module.exports = Resolve;
