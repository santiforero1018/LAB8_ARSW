var app = (function () {

    var drawId = null;

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Polygon {
        constructor(points) {
            this.points = points;
        }
    }

    var stompClient = null;



    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (polygon) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);


        for (var i = 1; i < polygon.points.length; i++) {
            ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
        }
        // Conectar el último punto con el primero para cerrar el polígono
        ctx.lineTo(polygon.points[0].x, polygon.points[0].y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        let aux = $('#pId').val();
        if (drawId !== aux) {
            var canvas = document.getElementById("canvas");
            var c = canvas.getContext("2d");
            c.clearRect(0, 0, canvas.width, canvas.height);
        }
        drawId = $('#pId').val();
        if (drawId) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            //subscribe to /topic/TOPICXX when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/newpoint.' + drawId, function (eventbody) {
                    var theObject = JSON.parse(eventbody.body);

                    var x = theObject.x;
                    var y = theObject.y;

                    // alert("Coordenada x: "+x+", Coordenarda y: "+y);

                    addPointToCanvas(new Point(x, y));
                });

                // Suscríbete al tópico '/topic/newpolygon' para recibir polígonos
                stompClient.subscribe('/topic/newpolygon.' + drawId, function (eventbody) {
                    var polygon = JSON.parse(eventbody.body);
                    var pt = polygon.points;
                    addPolygonToCanvas(new Polygon(pt));
                });

            });
        } else {
            alert('Digite el numero del dibujo sobre el cual va a trabajar');
        }

    };




    return {



        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            stompClient.send("/app/newpoint." + drawId, {}, JSON.stringify(pt));
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