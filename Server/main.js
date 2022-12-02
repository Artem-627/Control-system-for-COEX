const express = require('express');
const { send } = require('express/lib/response');

const path = require('path');

const app = express();

const PORT = 627; // порт для хоста

// Структура с целевыми состояниями коптеров в формате
/*
    '<Иденнтификатор коптера>': {
        x: <Координата x>,
        y: <Координата y>,
        z: <Координата z (высота)>,
        speed: <Скорость полета к целевой точке (в м/с)>,
        color: {
            red: <Доля красного в цвете подсветки>,
            green: <Доля зеленого в цвете подсветки>,
            blue: <Доля синего в цвете подсветки>,
        },
    }
*/
let result = {
    '0': {
        x: 0.9,
        y: 0.9,
        z: 1,
        speed: 0.5,
        color: {
            red: 0,
            green: 0,
            blue: 0,
        },
    },
    '1': {
        x: 2,
        y: 2,
        z: 2,
        speed: 0.5,
        color: {
            red: 0,
            green: 0,
            blue: 0,
        },
    }
};

// Структура со статусами коптеров (true если достиг целевой точки, false если на пути к ней)
let status = {
    '0': false,
    '1': false
};

// Точность полета (При большом значении коптер долго летает около целевой точки, прежде чем будет отправлен статус true,
//                  при маленьком значении коптер менее точно достигает целевой точки)
let accuracy = 0.1;

// Включение в проект директорий с нужными файлами
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/subjx/dist/js/')); // JS файлы из subjx
app.use(express.static(__dirname + '/subjx/dist/style/')); // CSS файлы из subjx

// Инициализация хоста
app.listen(PORT, '192.168.11.1', (error) => {
    error ? console.log(error) : console.log(`Listening PORT ${PORT}`);
});


// Страница получения действий для достижения целевого состояния
app.get('/getmove', (req, res) => {
    if ((Math.abs(result[req.query.id].x - req.query.x) <= accuracy) && (Math.abs(result[req.query.id].y - req.query.y) <= accuracy) && (Math.abs(result[req.query.id].z - req.query.z) <= accuracy)) {
        status[req.query.id] = true;
        console.log(req.query.id + " true");
    } else {
        status[req.query.id] = false;
        console.log(req.query.id + " false");
    }
    res.send(
        {
            "move_x": result[req.query.id].x - req.query.x,
            "move_y": result[req.query.id].y - req.query.y,
            "move_z": result[req.query.id].z - req.query.z,
            "speed": result[req.query.id].speed,
            "mode": result[req.query.id].mode,
            "colorRed": result[req.query.id].color.red,
            "colorGreen": result[req.query.id].color.green,
            "colorBlue": result[req.query.id].color.blue,
        }
    );
});

// Страница установки целевого состояния для коптера в формате
/*
    http://192.168.11.1:627/settarget?id=<Идентификатор коптера>&x=<Целевая координата x>&y=<Целевая координата y>&z=<Целевая координата z>&speed=<Скорость полета к целевой точке (в м/с)>&red=<Доля красного в цвете подсветки>&green=<Доля зеленого в цвете подсветки>&blue=<Доля синего в цвете подсветки>
*/
app.get('/settarget', (req, res) => {
    result[req.query.id].x = parseFloat(req.query.x);
    result[req.query.id].y = parseFloat(req.query.y);
    result[req.query.id].z = parseFloat(req.query.z);
    result[req.query.id].speed = parseFloat(req.query.speed);
    result[req.query.id].mode = parseInt(req.query.mode);
    result[req.query.id].color.red = parseInt(req.query.red);
    result[req.query.id].color.green = parseInt(req.query.green);
    result[req.query.id].color.blue = parseInt(req.query.blue);
    res.send("ok");
});

app.get('/', (req, res) => {
    console.log("/");
    res.send("Ok");
});

// Станица графического управления коптером
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Станица проверки работоспособности сервера (Если работает, выводит 1, если не равботает, долго грузит и ошибка)
app.get('/test', (req, res) => {
    console.log('Connection attempt');
    res.send("1");
});

// Страница получения целевого состояния коптера в формате
// http://192.168.11.1:627/gettarget?id=<Идентификатор коптера>
app.get('/gettarget', (req, res) => {
    console.log("/gettarget");
    res.send(
        {
            "x": result[req.query.id].x,
            "y": result[req.query.id].y,
            "z": result[req.query.id].z,
            "speed": result[req.query.id].speed,
            "mode": result[req.query.id].mode,
            "colorRed": result[req.query.id].color.red,
            "colorGreen": result[req.query.id].color.green,
            "colorBlue": result[req.query.id].color.blue,
        }
    );
});