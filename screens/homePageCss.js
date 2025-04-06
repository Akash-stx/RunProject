const css = `<style>

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
                    padding: 10px;
                    scrollbar-color: #6d7c77 #cfd7c7;
                }

            .project {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #f9f9f9;
                    position: relative;
                }


            .locked {
                pointer-events: none;
                opacity: 0.6;
            }

        

            .project-header {
                font-size: 1.1em;
                font-weight: bold;
                margin-bottom: 10px;
            }


            .mark-workspace{
                font-size: 10px;
                padding: 2px 6px;
                background: #dfc215;
                color: #555151;
                border-radius: 4px;
                position: relative;
                top: -7px;
                cursor: default;
            }

            .not-mark-workspace{
             padding: 2px 6px;
             opacity: 0;
            }
            
            #toggle-details-btn-id{
                position: relative;
                left: -13px;
                font-size: 11px;
                color: #87457d;
                top: 5px;
            }


            #autorunsuggession{
                position: relative;
                color: darkblue;
                top: 2px;
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

            .commands {
                margin-left: 24px;
                margin-bottom: 8px;
                margin-top: 12px;
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
                display: block; 
                margin-top: 5px;
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
                width: 30px;
                height: 22px;
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
                transition: .2s;
                border-radius: 24px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .2s;
                border-radius: 50%;
            }

            input:checked + .slider {
                background-color: #b8383d;
            }

            input:checked + .slider:before {
                transform: translateX(8px);
            }


            .tooltip-container {
                border: #fafaf8;
                padding-left: 7px;
                border-width: medium;
                border-style: solid;
                position: relative;
                left: -13px;
                top: 7px; 
            }

            .tooltip {
                position: relative;
                top: 3px;
                font-weight: 600;
                color: black;
                margin-right: 10px;
            }
            .toolTipHint  {
                position: relative;
                color: darkblue;
                top: 2px;
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
        </style>`;



module.exports = css;