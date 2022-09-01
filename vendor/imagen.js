let apiImagen = function () {
    const axios = require('axios').default;
    let j4 = {};
    let token = null;
    var moment = require('moment');
    const objUtilidades = require('./fileManager');
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
    j4.optimizerImagen = async function (bits,quality,ancho,png) {
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
    return {
        j4: j4
    };
}();
module.exports = apiImagen.j4;
