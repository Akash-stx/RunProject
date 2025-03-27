
function getImportContentView(inmportData) {


    const importHtml = inmportData?.length ? inmportData
        .map(({ default: { name } = {}, address } = {}) =>
            `<div id="parent">
            ${address} - ${name}
             <div id="children">
${chlid }
            </div >
         </div >`
        ).join('') : "<p id='noActionPresent' >No Actions Present</p>";



    return `< !DOCTYPE html >
    <html lang="en">
        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lazy Loaded Tree View</title>
                    <style>

                        body{
                        font - family: Arial, sans-serif;
                        padding: 20px;
                        }

                        .node{
                        margin - left: 20px;
                        cursor: pointer;
                        }

                        .children{
                        display: none;
                        margin-left: 20px;
                        }

                    </style>
                </head>
                <body>
                    <h1>Address Tree View</h1>

                    <div id="treeView">
                        ${importHtml}
                    </div>

                    <script>

                    </script >
</body >
</html > `
}




module.exports = getImportContentView;