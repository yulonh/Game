define(function(require, exports, module) {
    var utils = require('utils');
    //utils.debug = true;

    function recognizeCode(url, range, minWidth, minheight) {
        var img = new Image();

        img.onload = function(argument) {
            document.body.appendChild(img);
            var result = utils.textRecognizer(img, range, minWidth, minheight);
            console.log(result);
        };
        img.src = url;
    }

    recognizeCode('img/vcode.png', '0123456789', 10, 10);
    recognizeCode('img/vcode1.png', 'ABCDEFGHIJKLMNOPQRSTUVWSYZ', 10, 10);
    recognizeCode('img/vcode2.png', '痛通才财付富', 40, 40);
});