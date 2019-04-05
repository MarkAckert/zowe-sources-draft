"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const SourceTags_1 = require("./tags/SourceTags");
const download = require("download");
const Zip = require("adm-zip");
const rimraf = require("rimraf");
// tslint:disable
const OUTPUT_DIR = "output";
const OUTPUT_SOURCES = OUTPUT_DIR + path_1.sep + "sources";
const OUTPUT_ZIP = OUTPUT_DIR + path_1.sep + "zowe_sources.zip";
if (fs.existsSync(OUTPUT_ZIP)) {
    fs.unlinkSync(OUTPUT_ZIP);
}
if (fs.existsSync(OUTPUT_SOURCES)) {
    rimraf.sync(OUTPUT_SOURCES);
}
const repoZipballUrls = SourceTags_1.SourceTags.getRepositoriesWithTagsObject();
Promise.all(Object.values(repoZipballUrls).map((zipUrl) => download(zipUrl.toString(), OUTPUT_SOURCES))).then((result) => {
    const sourcesZip = new Zip();
    fs.readdirSync(OUTPUT_SOURCES).forEach((zipFile) => {
        sourcesZip.addLocalFile(zipFile);
    });
    sourcesZip.writeZip(OUTPUT_ZIP, (error) => {
        console.log(error);
        throw new Error("Error during zip write : " + error);
    });
    console.log("ZIP Write Complete, available here: " + OUTPUT_ZIP);
});
//# sourceMappingURL=index.js.map