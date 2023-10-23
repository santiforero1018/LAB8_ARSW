var app = (function () {

    var drawId = null;

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        drawId = $('#pId').val();
        console.log(drawId);
        if (drawId) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            //subscribe to /topic/TOPICXX when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/newpoint.'+ drawId, function (eventbody) {
                    var theObject = JSON.parse(eventbody.body);

                    var x = theObject.x;
                    var y = theObject.y;

                    // alert("Coordenada x: "+x+", Coordenarda y: "+y);

                    addPointToCanvas(new Point(x, y));
                });
            });
        } else {
            alert('Digite el numero del dibujo sobre el cual va a trabajar');
        }

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            //connectAndSubscribe();
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            stompClient.send("/topic/newpoint."+drawId, {}, JSON.stringify(pt));
            addPointToCanvas(pt);

            //publicar el evento
        },

        connectAndSubscribe,
        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();