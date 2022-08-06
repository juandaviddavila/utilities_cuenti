const fs = require("fs");
const AdmZip = require("adm-zip");
const zlib = require('zlib');
const uuidv4 = require("uuid");
const { shh } = require("shellsync");
const { execSync } = require("child_process");
//const gs = require('ghostscript4js');
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

let fileExistsDiretorio = function (path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
};
let fileExistsFile = function (path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
};
var base64ToFile = function (data) {
    // let buff = new Buffer(data);
    let buff = Buffer.from(data, "base64");
    return { content: buff };
};
var stringToBase64 = function (data) {
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');
    return base64data;
}
var base64String = function (data) {
    return Buffer.from(data, 'base64').toString(); // Ta-da
};
var fileToBase64 = function (input) {
    let strBase64 = input.content.toString('base64');
    return strBase64;
};
var compressGzip = function (input) {
    // var input = "Geek";
    // Calling gzip method
    var buffer = zlib.gzipSync(input);
    let base64 = buffer.toString('base64');
    return base64;
};

var compressPdf = async function (base64Pdf) {
    let rutaApp = process.cwd();
    if (!fileExistsDiretorio(rutaApp + "/tem/")) {
        fs.mkdirSync(rutaApp + "/tem/");
    }
    rutaApp = rutaApp + "/tem/";
    //guardar file disco
    let buff = new Buffer(base64Pdf, 'base64');
    let nameFile = uuidv4.v4();
    fs.writeFileSync(rutaApp + nameFile + ".pdf", buff);

    var stats = fs.statSync(rutaApp + nameFile + ".pdf");
    var fileSizeInBytes = stats.size;
    let r_Size = fileSizeInBytes * 0.001;
    let bln_procesar = true;
    if (r_Size > 1500) {//s es mas de una mega no procesar
        bln_procesar = false;
    }
    //crear sh
    let strSh = "#!/bin/bash \n gs -sDEVICE=pdfwrite -dNumRenderingThreads=2 -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH  -dQUIET -sOutputFile='" + rutaApp + nameFile + "_comprimir.pdf" + "' '" + rutaApp + nameFile + ".pdf" + "'";
    fs.writeFileSync(rutaApp + nameFile + ".sh", strSh);
    if (bln_procesar) {
        let isSsh = true;
        if (!isSsh) {
            try {
                // Take decision based on Ghostscript version
                const version = gs.version()
                console.log(version);
                let status = gs.executeSync("gs -sDEVICE=pdfwrite -dNumRenderingThreads=2 -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH  -dQUIET -sOutputFile='" + rutaApp + nameFile + "_comprimir.pdf" + "' '" + rutaApp + nameFile + ".pdf" + "'");
                console.log(status);
            } catch (err) {
                // Handle error
                console.error(err);
                //borro archivo para enviar el que envio
                try {
                    fs.unlinkSync(rutaApp + nameFile + "_comprimir.pdf");
                } catch (err) {
                }
            }
        } else {
            try {
                //shh.handleSignals({ timeout: 7000 });//7 seg
                let aux = `sh ${rutaApp + nameFile + ".sh"}`;
                let status = execSync(aux,
                    {
                        timeout: 10 * 12000,
                        // setting fake environment variable 😁
                        env: {
                            NODE_ENV: "production",
                        },
                    });
                console.log(status);
            } catch (err) {
                // Handle error
                console.error(err);
                //borro archivo para enviar el que envio
                try {
                    fs.unlinkSync(rutaApp + nameFile + "_comprimir.pdf");
                } catch (err) {
                }
            }
            //validar que termino de comprimir
            let interation = 0;
            while (true) {
                await sleep(200);
                if (fileExistsFile(rutaApp + nameFile + "_comprimir.pdf")) {
                    //valido si pesa mas de 10 kb
                    let stats = fs.statSync(rutaApp + nameFile + "_comprimir.pdf");
                    let fileSizeInBytes = stats.size;
                    if (fileSizeInBytes > 9000) {//mayor a 9 kb
                        break;
                    }
                }
                interation++;
                if (interation > 10) {
                    break;
                }
            }
        }
    }
    let r = { pdf_compress: null };
    if (fileExistsFile(rutaApp + nameFile + "_comprimir.pdf")) {
        r.pdf_compress = fs.readFileSync(rutaApp + nameFile + "_comprimir.pdf", { encoding: 'base64' });
        fs.unlinkSync(rutaApp + nameFile + "_comprimir.pdf");
    } else {
        r.pdf_compress = fs.readFileSync(rutaApp + nameFile + ".pdf", { encoding: 'base64' });
    }
    //eliminar file
    fs.unlinkSync(rutaApp + nameFile + ".pdf");
    fs.unlinkSync(rutaApp + nameFile + ".sh");
    return r;
    // falta retornar base 64 y esto en el server grande y aqui llamar esa api
    // validacion name correo debe ser iguial al nit
    // diseñar lo de la bd
}
var ziptoXmlPdf = function (file) {
    let content = {
        xml: null,
        pdf: null
    };
    var zip = new AdmZip(file.content);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
    zipEntries.forEach(function (zipEntry) {
        console.log(zipEntry.toString()); // outputs zip entries information
        if (zipEntry.entryName.indexOf(".pdf") > -1) {
            //console.log(Buffer.from(JSON.stringify(zipEntry.getData())).toString('base64'));
            content.pdf = zipEntry.getData().toString('base64');
        }
        if (zipEntry.entryName.indexOf(".xml") > -1) {
            // console.log(zipEntry.getData().toString("utf8"));
            content.xml = zipEntry.getData().toString("utf8");
        }
        // const encodedJsonObject = Buffer.from(JSON.stringify(jsonObject)).toString('base64'); 
        // console.log('--encodedJsonObject-->', encodedJsonObject)
        // //Output     --encodedJsonObject--> eyJOYW1lIjoiUmFtIiwiQWdlIjoiMjgiLCJEZXB0IjoiSVQifQ==

        // const decodedJsonObject = Buffer.from(encodedJsonObject, 'base64').toString('ascii'); 
        // console.log('--decodedJsonObject-->', JSON.parse(decodedJsonObject))
        // //Output     --decodedJsonObject--> {Name: 'Ram', Age: '28', Dept: 'IT'}
        // Buffer.from(JSON.stringify(zipEntry.getData()));
    });
    return content;
};
var getPach = async function () {
    return process.cwd();
}
var readFile = async function (file) {
    return await fs.readFileSync(file, { encoding: 'utf8' });

};
module.exports = {
    sleep, fileExistsDiretorio, fileExistsFile, ziptoXmlPdf, compressGzip, compressPdf,
    fileToBase64, stringToBase64, base64ToFile, fileExistsDiretorio, fileExistsFile, readFile, getPach, base64String
};
