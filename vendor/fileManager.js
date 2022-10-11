const fs = require("fs");
const AdmZip = require("adm-zip");
const zlib = require('zlib');
const uuidv4 = require("uuid");
const { shh } = require("shellsync");
var test = async function () {
    //leer de dinamod
    let filePath = "/home/juandaviddavila/Documentos/fuentes/j4pro/receptor_invonce/moledor_receptor_invonce/tem/castqkv95rietk51t88f1bfbaiqggko526mjs001"
    try {
        const data = await fs.promises.readFile(filePath, 'utf8')
        return data
    }
    catch (err) {
        console.log(err)
    }
};
let printLog = function (str) {
    console.log(moment().format('YYYY-DD-MM HH:mm:ss.SSS') + " " + str);
};
let dateFormat = function () {
    return moment().format('MM/DD/YYYY HH:mm:ss.SSS');
};
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
var createMkdirCwd = async function (name) {
    let rutaApp = process.cwd();
    if (!fileExistsDiretorio(rutaApp + "/" + name + "/")) {
        fs.mkdirSync(rutaApp + "/" + name + "/");
    }
}
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
    //crear sh
    let strSh = "gs -sDEVICE=pdfwrite -dNumRenderingThreads=2 -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH  -dQUIET -sOutputFile='" + rutaApp + nameFile + "_comprimir.pdf" + "' '" + rutaApp + nameFile + ".pdf" + "'";
    fs.writeFileSync(rutaApp + nameFile + ".sh", strSh);
    shh`sh ${rutaApp + nameFile + ".sh"}`;
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
        if (interation > 15) {
            break;
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
var compressZip = function (files, target) {
    // creating archives
    var zip = new AdmZip();

    // add file directly
    for (let i = 0; i < files.length; i++) {
        zip.addLocalFile(files[i]);
    }
    // get everything as a buffer
    //var willSendthis = zip.toBuffer();
    // or write everything to disk
    zip.writeZip(/*target file name*/ target);
}
var readFileToBase64 = function (file) {
    return fs.readFileSync(file, { encoding: 'base64' });
};
var readFileInput = function (file) {
    return { content: fs.readFileSync(file, null) };
};
var writerFileToBase64 = function (file, base64Data) {
    fs.writeFileSync(file, base64Data, 'base64');
};
var generateRandom = function () {
    return uuidv4.v4();
}
var writerFileToString = function (file, str) {
    fs.writeFileSync(file, str, 'utf8');
};

var managerErrorApi = function (res, e) {
    try {
        console.log("error:" + e);
        res.status(500);
        res.json({ status: 500, error: e.message });
    } catch (error) {

    }
};
var deleteFile = function (file) {
    try {
        fs.unlinkSync(file);
    } catch (error) { }
};
function betweenRandom(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
  };
  let copyObject = function (mainObj) {
    return JSON.parse(JSON.stringify(mainObj));
  };
module.exports = {betweenRandom,copyObject,
    managerErrorApi,deleteFile,
    createMkdirCwd, writerFileToString,
    readFileInput, printLog,
    writerFileToBase64, compressZip, readFileToBase64, generateRandom,
    sleep, fileExistsDiretorio, fileExistsFile, test, ziptoXmlPdf, compressGzip, compressPdf,
    fileToBase64, stringToBase64, base64ToFile, fileExistsDiretorio, fileExistsFile, readFile, getPach, base64String
};
