//---------------
//バーコード読み取りメイン処理
//　引用：　https://ameblo.jp/white-rabbit-0925/entry-12579659224.html

$(function () {
    startScanner();
});

const startScanner = () => {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#photo-area'),
            constraints: {
                decodeBarCodeRate: 3,
                successTimeout: 500,
                codeRepetition: true,
                tryVertical: true,
                frameRate: 15,

                //読み込み精度向上のための調整
                //width: 640,
                //height: 480,
                
                width: 800,
                height: 600,
                
                facingMode: "environment"
            },
        },
        decoder: {
            readers:[
                //EAN (JAN)コードを指定
                "ean_reader"
            ]
            /*
            readers: [
                //"i2of5_reader"
                "ean_reader"
            ]
            */
        },

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1
                    }, drawingCtx, {
                        color: "green",
                        lineWidth: 2
                    });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1
                }, drawingCtx, {
                    color: "#00F",
                    lineWidth: 2
                });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y'
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }
        }
    });

    //---------------
    //バーコード読み込み後の処理
    Quagga.onDetected(function (result) {

        gain_code = result.codeResult.code

        //チェックデジットと最初の頭一桁(4で始まる)でコード判定
        if(eanCheckDigit(gain_code)&gain_code.charAt(0)=="4"){

            $("#jan").html(gain_code).change();
            $("#jan").css("display","none");
            

        }

    });
}

//---------------
//読み取ったバーコードのエラー検査
//　引用：　https://qiita.com/mm_sys/items/9e95c48d4684957a3940

function eanCheckDigit(barcodeStr) { // 引数は文字列
    // 短縮用処理
    barcodeStr = ('00000' + barcodeStr).slice(-13);
    let evenNum = 0, oddNum = 0;
    for (var i = 0; i < barcodeStr.length - 1; i++) {
        if (i % 2 == 0) { // 「奇数」かどうか（0から始まるため、iの偶数と奇数が逆）
            oddNum += parseInt(barcodeStr[i]);
        } else {
            evenNum += parseInt(barcodeStr[i]);
        }
    }
    // 結果
    return 10 - parseInt((evenNum * 3 + oddNum).toString().slice(-1)) === parseInt(barcodeStr.slice(-1));
}

//---------------
//終了処理 (bodyを上書き、終了メッセージと初期画面リロードのナビゲーションを表示)
function end_application(count){
    const g_point = localStorage.getItem("goo_point");
    //const g_point_str = disp_gpoint(g_point);

    const score = count-par
    let message = "";

    if(count==1){
        message = "ホールインワンおめでとう！！"
    } else if (score==-4){
        message = "トリプル・イーグル！！"
    } else if (score==-3){
        message = "ダブル・イーグル！！"
    } else if (score==-2){
        message = "イーグル！！"
    } else if (score==-1){
        message = "バーディー！！"
    } else if (score==-0){
        message = "パー！！"
    } else if (score==1){
        message = "ボギー！"
    } else if (score==2){
        message = "ダブル・ボギー"
    } else if (score==3){
        message = "トリプル・ボギー"
    } else{
        message = "がんばりま賞！！"
    }

    const end_html=`<h1>ナイスイン！！</h1>
        <h2>${message}</h2>
        <table>
        <tr><th></th><th></th><tr>
        <p>コース長: ${bud} ¥ards</p>
        <p>パー: ${par} </p>
        <p>ストローク: ${count} 打</p>
        <p>スコア: ${count-par} 打</p>
        
        <p><a href="./index.html">トップに戻る</a></p>
        `;
    //alert(par);

    $("body").html(end_html);
}

//---------------
//Budgetの初期化（前画面からの遷移）
const query = location.search;
const params = query.split('&');
let param_obj={}
for (let i = 0; i<params.length; i++){
    vals = params[i].replace("?","").split("=");
    param_obj[vals[0]] = vals[1];

}
const value = query.split('=');

const bud = Number(decodeURIComponent(param_obj["budget"]));
const par = Number(decodeURIComponent(param_obj["par"]));

console.log(bud,par)

if(bud != ""){
    const key = "set_budget";
    localStorage.removeItem(key);
    localStorage.setItem(key, bud);
    round_bud =Math.round(bud/10)*10;

    $("#budget").html(`<p>残り距離: ${round_bud.toLocaleString()} ¥ards</p><p>   Par: ${par.toLocaleString()}</p>`);
}
