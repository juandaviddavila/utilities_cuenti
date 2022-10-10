let apiImagen = function () {
    const axios = require('axios').default;
    let j4 = {};
    let token = null;
    var moment = require('moment');
    const objUtilidades = require('./fileManager');
    let fs = require('fs');
    j4.loginApi = async function () {
        try {
            if (token !== null) {
                //validar si fue creado hace mas de 1 hora
                if (Math.abs(moment.duration(moment(token.fecha).diff(new Date())).asMinutes()) < 60) {
                    console.log('token ya listo');
                    return true;
                }
            }
            var config = {
                method: 'post',
                url: 'https://app.cuenti.com/api_j4pro_node/v1/autenticar_j4_pro_liviano',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "user": "j4pro",
                    "pass": "api_j4pro_liviana!&Q=?¿?"
                }
            };
            const resp = await axios(config);
            token = { fecha: new Date(), token: resp.data.token };
            console.log('token:' + resp.data.token);
            j4.token = token;
            return true;
        } catch (err) {
            token = null;
            console.log(err.message);
            j4.token = token;
            return false;
        }
    }
    j4.optimizerImagenApi = async function (bits,quality,ancho,png) {
        try {
            await j4.loginApi();
            var config = {
                method: 'post',
                url: 'https://api.j4pro.com/api_node/v1/utilidades/optmizarImagen',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': token.token
                },
                data: {
                    bits:bits,
                    quality:quality,
                    ancho:ancho,
                    png:png
                }
            };
            const resp = await axios(config);
            // console.log(resp.data);
            return await resp.data;
        } catch (err) {
            // Handle Error Here
            console.error(err);
            return await null;
        }
    };
    let fileExistsDiretorio = function (path) {
        try {
            return fs.statSync(path).isDirectory();
        } catch (e) {
            return false;
        }
    };
    function getFilesizeInBytes(filename) {
        var stats = fs.statSync(filename);
        var fileSizeInBytes = stats["size"];
        return fileSizeInBytes;
    }
    j4.optmizarImagen = async function (req, res) {
        try {
            /* RESIZE OPTIMIZE IMAGES */
            const Jimp = require('jimp');
            let quality = 70;
            let ancho = 200;
            if (req.body.quality !== undefined) {
                quality = req.body.quality;
            }
            if (req.body.ancho !== undefined) {
                ancho = req.body.ancho;
            }
            console.log(process.cwd());
            var uuid = require('uuid');

            if (!fileExistsDiretorio(process.cwd() + "/temp")) {
                // shell.mkdir('-p', ruta_fija + '/msj_canal/' + objeto.canal);
                fs.mkdirSync(process.cwd() + "/temp", true);
            }
            let nombreArchivo = uuid.v1() + "." + req.body.ext;
            let rutaTemporal = process.cwd() + "/temp" + "/" + nombreArchivo;


            var base64Data = req.body.bits.replace(/^data:image\/png;base64,/, "");

            fs.writeFileSync(rutaTemporal, base64Data, 'base64');

            module.exports = async (images, width, height = Jimp.AUTO, quality) => {
                await Promise.all(
                    images.map(async imgPath => {
                        const image = await Jimp.read(imgPath);
                        await image.resize(width, height);
                        await image.quality(quality);
                        await image.writeAsync(imgPath);
                    })
                );
            };

            const resizeOptimizeImages = require('resize-optimize-images');
            // Set the options.
            const options = {
                images: [rutaTemporal],
                width: ancho,
                quality: quality
            };
            // Run the module.
            let retrono = await resizeOptimizeImages(options);
            //convertir file a base64
            var bitmap = fs.readFileSync(rutaTemporal);
            // convert binary data to base64 encoded string
            let base64Retorno = new Buffer(bitmap).toString('base64');
            let tamano = getFilesizeInBytes(rutaTemporal);
            fs.unlinkSync(rutaTemporal);
            res.json({ bits: base64Retorno, tamano: tamano });
        } catch (exception) {
            console.error(exception.message);
            res.send(exception.toString());
        }
    };
    return {
        j4: j4
    };
}();
module.exports = apiImagen.j4;
