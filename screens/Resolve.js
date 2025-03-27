function Resolve(data) {
    const actions = Object.values(data);
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

            #viewActionList {
                background-color: #007bff; /* Blue */
            }
            #viewActionList:hover {
                background-color: #0069d9; /* Darker blue */
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

        </style>
    </head>
    <body>
        <h1>Unable to Run: It May Already Be Active, Please Resolve Manually</h1>
        <div id="checkboxes">
          ${checkboxesHtml}
        </div>
        <div class="button-container">
            <button id="runButton">Restart Selected</button>
            <button id="viewActionList">Go to Action List</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const viewActionListButton = document.getElementById('viewActionList');

            viewActionListButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'showList',
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
                        command: 'restartTerminal',
                        data: result
                    });
                }
               
            });


        </script>
    </body>
    </html>`;
}

module.exports = Resolve;
