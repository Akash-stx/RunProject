function addNewCommandUIpage({ eachProjectLocator } = {}) {
  const projects = eachProjectLocator().map((data) => data?.searchBox)?.join();
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Action Form</title>
       <style>
    body {
      font-family: 'Segoe UI', 'Roboto', sans-serif;
      font-size: 15px;
      background-color: #f5f7fa;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: start;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
      max-width: 600px;
      width: 100%;
      padding: 30px 28px;
      box-sizing: border-box;
    }

    #headerr {
      font-size: 22px;
      font-weight: 600;
      color: #4a90e2;
      text-align: center;
      margin-bottom: 24px;
      border-bottom: 2px solid #4a90e2;
      padding-bottom: 8px;
    }

    label {
      font-weight: 500;
      color: #333;
      display: block;
      margin: 16px 0 6px;
    }

    input[type="text"],
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 14px;
      transition: 0.2s ease-in-out;
      box-sizing: border-box;
    }

    input[type="text"]:focus,
    textarea:focus {
      border-color: #007acc;
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.15);
    }

    textarea {
      font-family: monospace;
      min-height: 100px;
      resize: vertical;
    }

    #suggestionsBox {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 30px;
    }

    #workspaceNote,
    #projectError {
      font-size: 12px;
      margin-left: 26px;
    }

    #workspaceNote {
      color: #666;
    }

    #projectError {
      color: red;
      display: none;
    }

    #bulkDataLabel,
    #bulkData {
      display: none;
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 30px;
    }

    button {
      flex: 1;
      padding: 12px;
      font-size: 15px;
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      transition: 0.2s;
    }

    #submit {
      background-color: #28a745;
    }

    #submit:hover {
      background-color: #218838;
    }

    #viewActionList {
      background-color: #007bff;
    }

    #viewActionList:hover {
      background-color: #0069d9;
    }

    @media (max-width: 500px) {
      .button-group {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 id="headerr">Add New Command</h1>

    <label class="checkbox-group">
      <input type="checkbox" id="bulkToggle" /> Enable Bulk Entry
    </label>

    <label for="searchBox">Project Name</label>
    <input type="text" id="searchBox" placeholder="e.g. MyApp, PortfolioSite, API-Server" required />
    <ul id="suggestionsBox"></ul>

    <label for="name">Command Title</label>
    <input type="text" id="name" placeholder="e.g. Start Dev Server" required />

    <label for="command">Command</label>
    <input type="text" id="command" placeholder="e.g. npm install ; npm run dev" required />

    <div class="checkbox-group">
      <input type="checkbox" id="isWorkspaceToggle" />
      <label for="isWorkspaceToggle" style="margin: 0;">
        Set this folder as the active workspace for the entered project name
      </label>
    </div>

    <p id="workspaceNote"><i>Each 'project name' require a workspace to run properly.</i></p>
    <p id="projectError">Please enter a project name before setting a workspace.</p>

    <label for="bulkData" id="bulkDataLabel">Bulk JSON Input:</label>
    <textarea
      id="bulkData"
      placeholder='Enter JSON format:
[{"name": "name1", "command": "command1"},
{"name": "name2", "command": "command2"}]
No duplicate Name'
    >{
  "id": {
    "datas": {
      "188": {
        "actualCommand": "example start",
        "commandDescription": "example"
      }
    },
    "projectName": "ve project"
  }
}</textarea>

    <div class="button-group">
      <button id="submit">Submit</button>
      <button id="viewActionList">Back</button>
    </div>
  </div>
        
        <script>
            const vscode = acquireVsCodeApi();
            const submitButton = document.getElementById('submit');
            const viewActionListButton = document.getElementById('viewActionList');
            const bulkToggle = document.getElementById('bulkToggle');
            const bulkData = document.getElementById('bulkData');
            const nameField = document.getElementById('name');
            const commandField = document.getElementById('command');
            const bulkDataLabel= document.getElementById('bulkDataLabel');
            const input = document.getElementById("searchBox");
            const suggestionBox = document.getElementById("suggestionsBox");
            const isWorkspaceToggle = document.getElementById("isWorkspaceToggle");
            

            // Toggle between single and bulk entry modes
            bulkToggle.addEventListener('change', () => {
                const isBulk = bulkToggle.checked;
                nameField.disabled = isBulk;
                commandField.disabled = isBulk;
                bulkData.style.display = isBulk ? 'block' : 'none';
                bulkDataLabel.style.display = isBulk ? 'block' : 'none';
                input.style.display = isBulk ?  'none':'block' ;
                suggestionBox.style.display= isBulk ? 'none':'block' ;
            });

            viewActionListButton.addEventListener('click', () => {
                vscode.postMessage({
                    callMethod: 'homePage',
                    data: null
                });
            });


            const suggestions = [${projects}];

            
            function hideSuggestion(){
                     suggestionBox.style.opacity = "0";
                     suggestionBox.style.pointerEvents = "none"; // Prevent it from blocking clicks

            }
            hideSuggestion();


            

            function ShowSuggestion(){
                     suggestionBox.style.opacity = "1";
                     suggestionBox.style.pointerEvents = "auto"; // Allow interactions

            }

            input.addEventListener("input", () => {
                const value = input.value.trim().toLowerCase();
                suggestionBox.innerHTML = "";
                if (value) {
                    const filtered = suggestions.filter(item => item.toLowerCase().includes(value));
                    if(filtered?.length){ 
                     ShowSuggestion();
                    }else{
                     hideSuggestion();
                    }
                    
                    filtered.forEach(suggestion => {
                        const li = document.createElement("li");
                        li.textContent = suggestion;
                        li.addEventListener("click", () => {
                            input.value = suggestion;
                            suggestionBox.innerHTML = "";
                        });
                        suggestionBox.appendChild(li);
                    });
                }else{
                   hideSuggestion();
                }
            });

            // Hide suggestions when clicking outside
            document.addEventListener("click", (event) => {
            if (!input.contains(event.target) && !suggestionBox.contains(event.target)) {
                suggestionBox.innerHTML = "";
                suggestionBox.style.opacity = "0";
                suggestionBox.style.pointerEvents = "none"; // Prevent it from blocking clicks
            }
           });

            submitButton.addEventListener('click', () => {
                if (bulkToggle.checked) {
                    // Handle bulk JSON input
                    const bulkJson = bulkData.value.trim();
                    try {
                        const bulkActions = JSON.parse(bulkJson);
                        vscode.postMessage({
                            callMethod: 'createBulkCommands',
                            data: bulkActions
                        });
                    } catch (error) {
                        vscode.postMessage({
                            callMethod: 'alert',
                            data: "Invalid JSON format. Please check your input."
                        });
                    }
                } else {
                    // Handle single entry input
                    const projectName =input.value.trim();
                    const name = nameField.value.trim();
                    const command = commandField.value.trim();
                    if (command && name && projectName) {
                        vscode.postMessage({
                            callMethod: 'createCommand',
                            data: { name, command , projectName,isWorkspaceToggle:isWorkspaceToggle?.checked}
                        });
                    } else {
                        vscode.postMessage({
                            callMethod: 'alert',
                            data: "Please fill all fields."
                        });
                    }
                }
            });
        </script>
    </body>
<style>
  #suggestionsBox {
    position: absolute;
    z-index: 1000; /* High z-index to keep it above */
    background: white;
    border: 1px solid #ccc;
    max-width: 200px;
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 5px;
    cursor: pointer;
    background: #fff;
  }

  li:hover {
    background: #eee;
  }
</style>
    </html>`;
}

module.exports = addNewCommandUIpage;
