let apiEmail = function () {
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
    let formatEmail=function(dataEmail){
        dataEmail.htmlBase64 = 1;
        dataEmail.html = objUtilidades.stringToBase64(dataEmail.html);
        dataEmail.subject = objUtilidades.stringToBase64(dataEmail.subject);
        if (dataEmail.from !== undefined) {
            if (dataEmail.from !== null) {
                if (dataEmail.from.length > 0) {
                    dataEmail.from = objUtilidades.stringToBase64(dataEmail.from);
                }
            }
        }
        return dataEmail;
    }
    j4.sendMailThread = async function (dataEmail) {
        try {
            dataEmail=formatEmail(dataEmail);
            // dataEmail = {
            //     "htmlBase64": 1,
            //     "html": objUtilidades.stringToBase64(html),
            //     "from": '',
            //     "replyTo": '',
            //     "to": email,
            //     "subject": objUtilidades.stringToBase64(asunto),
            //     "attachments": []
            // };
            await j4.loginApi();
            var config = {
                method: 'post',
                url: 'https://app.cuenti.com/api_node/v1/utilidades/sendMailHilo',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': token.token
                },
                data: dataEmail
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
    j4.sendMail = async function (dataEmail) {
        try {
            dataEmail=formatEmail(dataEmail);
            await j4.loginApi();
            var config = {
                method: 'post',
                url: 'https://app.cuenti.co/api_node/v1/utilidades/sendMail',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': token.token
                },
                data: dataEmail
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
module.exports = apiEmail.j4;
