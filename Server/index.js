// Переменный с целевым состоянием коптера
var targetX = 0;
var targetY = 1.8;
var targetZ = 1;
var targetSpeed = 0.5;
var targetColor = {
    red: 0,
    green: 0,
    blue: 0
};

// Изменение целевой позиции при перемещении Drag&Drop'а
copter.onmousedown = function(event) {
  let shiftX = event.clientX - copter.getBoundingClientRect().left;
  let shiftY = event.clientY - copter.getBoundingClientRect().top;

  copter.style.position = 'absolute';
  copter.style.zIndex = 1000;
  document.body.append(copter);

  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    copter.style.left = pageX - shiftX + 'px';
    copter.style.top = pageY - shiftY + 'px';

    if (pageX - shiftX <= 9){
      copter.style.left = "9px";
    }
    if ((pageX - shiftX >= 720 - 115 + 9) || (shiftX >= 720 - 115 + 9)){
      copter.style.left = "614px";
    }
    if (pageY - shiftY <= 9){
      copter.style.top = "9px";
    }
    if ((pageY - shiftY >= 720 - 115 + 9) || (shiftY >= 720 - 115 + 9)){
      copter.style.top = "614px";
    }

    targetX = Math.round((parseInt(copter.style.left) - 9) / 605 * 1.8 * 100) / 100;
    targetY = Math.abs((Math.round((parseInt(copter.style.top) - 9) / 605 * 1.8 * 100) / 100) - 1.8);
    setTarget(targetX, targetY, targetZ, targetSpeed, targetColor.red, targetColor.green, targetColor.blue);
  }

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  // move the copter on mousemove
  document.addEventListener('mousemove', onMouseMove);

  // drop the copter, remove unneeded handlers
  copter.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    copter.onmouseup = null;
  };

};

copter.ondragstart = function() {
  return false;
};

// Кнопка посдки
var land_button = document.getElementById('land_button');
// Посадка при ее нажатии
land_button.onclick = function() {
    setTarget(targetX, targetY, 0, 0.5);
};

// Структура для высоты коптера
var height = {
    range: document.getElementById('height_input'),
    text: document.getElementById('height_text')
};
// При изменении высоты
height.range.onchange = function() {
        targetZ = height.range.value;
        height.text.innerHTML = targetZ;
        setTarget(targetX, targetY, targetZ, targetSpeed, targetColor.red, targetColor.green, targetColor.blue);
}
height.range.onmousemove = height.range.onchange;

// Структура для скорости коптера
var speed = {
    range: document.getElementById('speed_input'),
    text: document.getElementById('speed_text')
};
// При изменении скорости
speed.range.onchange = function() {
        targetSpeed = speed.range.value;
        speed.text.innerHTML = targetSpeed;
        setTarget(targetX, targetY, targetZ, targetSpeed, targetColor.red, targetColor.green, targetColor.blue);
}
speed.range.onmousemove = speed.range.onchange;

// Переменная для цвета подсветки
var color = document.getElementById('color_input');
// При изменении цвета подсветки
color.onchange = function() {
        targetColor.red = parseInt(color.value[1]+color.value[2], 16, 10);
        targetColor.green = parseInt(color.value[3]+color.value[4], 16, 10);
        targetColor.blue = parseInt(color.value[5]+color.value[6], 16, 10);
        setTarget(targetX, targetY, targetZ, targetSpeed, targetColor.red, targetColor.green, targetColor.blue);
}
color.onmousemove = color.onchange;

// Функция обрашени к серверу с изменением целевого состояния
async function setTarget(targetX=null, targetY=null, targetZ=null, targetSpeed=null, targetRed=0, targetGreen=0, targetBlue=0){
    let response = await fetch(`http://192.168.11.1:627/settarget?id=0&x=${targetX}&y=${targetY}&z=${targetZ}&speed=${targetSpeed}&yaw=0&red=${targetRed}&green=${targetGreen}&blue=${targetBlue}`,
  {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
  });
    if (response.ok) {
      let json = await response.text();
    } else {
      console.log(response);
    }
}