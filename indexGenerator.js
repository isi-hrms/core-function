/** @format */

const path = require('path');
const fs = require('fs');
const jsBeautify = require('js-beautify');

const folders = ['controller', 'procedure', 'validator', 'library'];

function generateTemplate(requires) {
    return `module.exports={${requires
        .map(function(value) {
            return `${value}:require('./${value}'),`;
        })
        .join('')}}`;
}

folders.forEach((element) => {
    const subFolderPath = path.join(__dirname, 'app', element);
    const indexPath = path.join(subFolderPath, 'index.js');

    const fileList = fs
        .readdirSync(subFolderPath)
        .filter((e) => e !== 'index.js')
        .map((e) => e.replace(/\.[^/.]+$/, ''));
    const fileContent = jsBeautify.js(generateTemplate(fileList));
    fs.writeFileSync(indexPath, fileContent);
});
