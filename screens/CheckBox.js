function CheckBox(data) {
    const actions = Object.values(data);
    const toExport = JSON.stringify(actions);
    const checkboxesHtml = actions?.length ? actions
        .map(item => `
      <div class="item">
        <label>
          <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''}>
          ${item.name}
        </label>
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
                font-family: Arial, sans-serif;
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
            .item {
                margin-bottom: 15px;
                padding: 10px;
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
            #deleteButton {
                background-color: #dc3545; /* Red */
            }
            #deleteButton:hover {
                background-color: #c82333; /* Darker red */
                transform: translateY(-1px);
            }

            #stopButton {
                background-color: #dc3545; /* Red */
            }
            #stopButton:hover {
                background-color: #c82333; /* Darker red */
                transform: translateY(-1px);
            }
            #restartButton {
                background-color: #dc3545; /* Red */
            }
            #restartButton:hover {
                background-color: #c82333; /* Darker red */
                transform: translateY(-1px);
            }
            
            #createNewAction {
                background-color: #007bff; /* Blue */
            }
            #createNewAction:hover {
                background-color: #0069d9; /* Darker blue */
                transform: translateY(-1px);
            }

            #exportButton{
            background-color: #009688; /* green */
            }

             #exportButton:hover {
                background-color: #00796b; /* Darker blue */
                transform: translateY(-1px);
            }
                
            .button-container {
                display: flex;
                justify-content: center; /* Center buttons */
                width: 100%; /* Full width for button container */
            }

            #noActionPresent{
            text-align: center;
            color: black;
            }

              #exportData {
            position: absolute; /* Position it off-screen */
            left: -9999px; /* Move it off the visible area */
            width: 1px; /* Minimal width */
            height: 1px; /* Minimal height */
            opacity: 0; /* Fully transparent */
        }
        </style>
    </head>
    <body>
        <textarea id="exportData">${toExport}</textarea>
        <h1>Actions</h1>
        <div id="checkboxes">
          ${checkboxesHtml}
        </div>
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
            // Handle button clicks
            document.getElementById('runButton').addEventListener('click', function() {
                const result={};
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'));

                  checkedItems.forEach(input => {
                   result[input.id]=input.id;
                   });

                  if (checkedItems?.length) {
                    vscode.postMessage({
                        command: 'createTerminal',
                        data: result
                    });
                }
                
            });

            document.getElementById('exportButton').addEventListener('click', () => {
                const exportData = document.getElementById('exportData');
                exportData.select(); // Selects the content inside the textarea
                document.execCommand('copy'); // Copies the selected text to clipboard

                 
                 vscode.postMessage({
                            command: 'alert',
                            data: "Data copied to clipboard!"
                        });
            });



            document.getElementById('deleteButton').addEventListener('click', function() {
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
                    .map(input => input.id);

                if (checkedItems?.length) {
                    vscode.postMessage({
                        command: 'deleteActions',
                        data: checkedItems
                    });
                }
            });


            document.getElementById('stopButton').addEventListener('click', function() {
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
                    .map(input => input.id);

                if (checkedItems?.length) {
                    vscode.postMessage({
                        command: 'stopActions',
                        data: checkedItems
                    });
                }
            });


            document.getElementById('restartButton').addEventListener('click', function() {
                const checkedItems = Array.from(document.querySelectorAll('#checkboxes input[type="checkbox"]:checked'))
                    .map(input => input.id);

                if (checkedItems?.length) {
                    vscode.postMessage({
                        command: 'restartTerminal',
                        data: checkedItems
                    });
                }
            });
            
            

            document.getElementById('createNewAction').addEventListener('click', function() {
                vscode.postMessage({
                    command: 'openCreateAction',
                    data: null
                });
            });
        </script>
    </body>
    </html>`;
}

module.exports = CheckBox;
