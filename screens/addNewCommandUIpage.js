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
                font-weight: bold;
                font-family: 'Consolas', 'Roboto Mono', 'Ubuntu Mono', 'Courier New', monospace;
                font-size: 15px; /* Adjust size as needed */
                line-height: 1.5; /* Improve readability */
                padding: 20px;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 400px;
            }
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin: 10px 0 5px;
                color: #555;
            }
            input[type="text"], textarea {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 4px;
                transition: border 0.3s;
            }
            input[type="text"]:focus, textarea:focus {
                border-color: #007acc;
                outline: none;
            }
            button {
                width: 48%;
                padding: 10px;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                margin-top: 10px;
                font-size: 16px;
                transition: background-color 0.3s;
            }
            #submit {
                background-color: #28a745; /* Green */
            }
            #submit:hover {
                background-color: #218838; /* Darker green */
            }
            #viewActionList {
                background-color: #007bff; /* Blue */
            }
            #viewActionList:hover {
                background-color: #0069d9; /* Darker blue */
            }
            #bulkData {
                display: none;
                height: 100px;
            }
            #bulkDataLabel {
                display: none;
            }

             #headerr {
                font-family: 'Arial', sans-serif;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                color: #4a90e2; /* Solid blue color */
                margin: 20px 0;
                padding-bottom: 5px;
                border-bottom: 2px solid #4a90e2; /* Underline effect */
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 id="headerr">Add New Command</h1>
            <label><input type="checkbox" id="bulkToggle"> Enable Bulk Entry</label>
            <label for="searchBox">Project Name</label>
            <input type="text" id="searchBox" placeholder="e.g. MyApp, PortfolioSite, API-Server" required>
            <ul id="suggestionsBox" ></ul>
            <label for="name">Command Title</label>
            <input type="text" id="name" placeholder="e.g. Start Dev Server" required>
            
            <label for="command">Command</label>
            <input type="text" id="command" placeholder="e.g. npm install ; npm run dev" required>
            
           <div style="margin: 10px 0; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="isWorkspaceToggle" />
                <label for="isWorkspaceToggle" style="margin: 0; font-size: 14px;">
                Set this folder as the active workspace for the entered project name
                </label>
            </div>

            <p id="workspaceNote" style="margin: 4px 0 8px 22px; font-size: 12px; color: #666;">
                <i>Commands require a workspace folder to run properly.</i>
            </p>

            <p id="projectError" style="color: red; font-size: 13px; display: none; margin: 0 0 10px 22px;">
                Please enter a project name before setting a workspace.
            </p>
            </div>

            <label for="bulkData" id="bulkDataLabel">Bulk JSON Input:</label>
            <textarea id="bulkData"  placeholder='Enter JSON format: \n[{"name": "name1", "command": "command1"}, \n{"name": "name2", "command": "command2"}]\n No duplicate Name'>
            {
                "id": {
                    "datas": {
                        "188": {
                            "actualCommand": "example start",
                            "commandDescription": "example"
                        }
                    },
                    "projectName": "ve project"
                }
            }
    </textarea>
            
            <button id="submit">Submit</button>
            <button id="viewActionList">Go to Action List</button>
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
