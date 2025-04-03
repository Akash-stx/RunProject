function Resolve(data) {
    const actions = Object.values(data);
    const checkboxesHtml = actions?.length ? actions
        .map(item => `
           <div class="parent">
            <div class="parent-name">${item.name}</div>
            <div class="items-container">
                <div class="item">
                <label>
                    <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''}>
                    ${item.name}
                </label>
                </div>
            </div>
            </div>
    `).join('') : "<p id='noActionPresent' >No Actions Present</p>";

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
            }
            h1 {
                color: #333;
            }
            .parent {
    margin-bottom: 20px;
    padding: 10px;
    background: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.parent-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding-bottom: 5px;
    border-bottom: 2px solid #ddd;
    margin-bottom: 10px;
}

.items-container {
    padding-left: 10px; /* Indent items under parent */
}

.item {
    margin-bottom: 10px;
    padding: 8px;
    background: #ffffff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

        </style>
    </head>
    <body>
        <h1>Manual Resolution: Check if already active and resolve.</h1>
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
                const result=[];
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'));

                  checkedItems.forEach(input => {
                   result.push(input.id);
                   });

                  if (result?.length) {
                    vscode.postMessage({
                        callMethod: 'restartTerminal',
                        data: result
                    });
                }
               
            });


        </script>
    </body>
    </html>`;
}

module.exports = Resolve;
