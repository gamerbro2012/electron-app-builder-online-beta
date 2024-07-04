// script.js
document.getElementById('generate-btn').addEventListener('click', generateApp);

function generateApp() {
    const htmlFile = document.getElementById('html-file').files[0];
    const customJs = document.getElementById('custom-js').value;
    const customLang = document.getElementById('custom-lang').value;

    if (!htmlFile) {
        alert('Please upload an HTML file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const htmlContent = event.target.result;
        createElectronApp(htmlContent, customJs, customLang);
    };
    reader.readAsText(htmlFile);
}

function createElectronApp(htmlContent, customJs, customLang) {
    const zip = new JSZip();
    const appFolder = zip.folder("my-electron-app");

    const packageJson = {
        name: "my-electron-app",
        version: "1.0.0",
        main: "main.js"
    };

    const mainJs = `
        const { app, BrowserWindow } = require('electron');
        const path = require('path');
        
        function createWindow() {
            const mainWindow = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js')
                }
            });

            mainWindow.loadFile('index.html');
        }

        app.on('ready', createWindow);
        
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    `;

    const preloadJs = `
        window.addEventListener('DOMContentLoaded', () => {
            ${customJs}
        });
    `;

    // Add HTML content
    appFolder.file("index.html", htmlContent);
    // Add JS files
    appFolder.file("main.js", mainJs);
    appFolder.file("preload.js", preloadJs);
    // Add package.json
    appFolder.file("package.json", JSON.stringify(packageJson, null, 2));

    // Convert custom language to JS (simple example)
    const customLangJs = customLang.replace(/print\("(.+)"\)/g, 'console.log("$1")');

    appFolder.file("customLang.js", customLangJs);

    // Generate zip file
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = URL.createObjectURL(content);
        downloadLink.download = "my-electron-app.zip";
        downloadLink.style.display = 'block';
    });
}
