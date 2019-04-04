const fs = require('fs');
const rimraf = require('rimraf');
const download = require('download');
const AdmZip = require('adm-zip');
const path = require('path');

const isFile = source => fs.lstatSync(source).isFile();
const filesInDir = source => fs.readdirSync(source).filter(fsNode => isFile(path.join(source, fsNode)));


if (fs.existsSync("output/sources")) {
    rimraf.sync("output/sources");
}
fs.mkdirSync("output/sources");

if (fs.existsSync("output/source_ball.zip")) {
    fs.unlinkSync("output/source_ball.zip");
}

const zipballUrls = JSON.parse(fs.readFileSync("output/zipball_map.json", 'utf-8'));


Promise.all(Object.values(zipballUrls).map(x => download(x, 'output/sources'))).then(() => {
    console.log('Files downloaded, creating zip!');
    const zipArchives = filesInDir("output/sources");
    const zip = new AdmZip();
    zipArchives.forEach((archive) => {
        zip.addLocalFile(path.join("output", "sources", archive));
    })
    zip.addLocalFile(path.join("rules","README.md"));
    zip.writeZip(path.join("output", "source_ball.zip"), (error) => {
        console.log(error);
        throw new Error("Error during zip write : " + error);
    });
});

console.log(filesInDir("output"));