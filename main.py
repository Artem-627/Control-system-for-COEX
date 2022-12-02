from clover import srv
from std_srvs.srv import Trigger
from clover.srv import SetLEDEffect
import rospy
import math
import requests

# Инициализация узла ROS для полета
rospy.init_node('flight')

# Установка необходимых констант
get_telemetry = rospy.ServiceProxy('get_telemetry', srv.GetTelemetry)
set_effect = rospy.ServiceProxy('led/set_effect', SetLEDEffect, persistent=True)
navigate = rospy.ServiceProxy('navigate', srv.Navigate)
land = rospy.ServiceProxy('land', Trigger)

# Обьявление функций для полета
def navigate_wait(x=0, y=0, z=0, speed=0.5, frame_id='body', auto_arm=False):
    res = navigate(x=x, y=y, z=z, yaw=float('nan'), speed=speed, frame_id=frame_id, auto_arm=auto_arm)

    if not res.success:
        raise Exception(res.message)

    while not rospy.is_shutdown():
        telem = get_telemetry(frame_id='navigate_target')
        if math.sqrt(telem.x ** 2 + telem.y ** 2 + telem.z ** 2) < 0.2:
            return
        rospy.sleep(0.2)

def land_wait():
    land()
    while get_telemetry().armed:
        rospy.sleep(0.2)

# Подключение к серверу
set_effect(effect='fill', r=255, g=0, b=0)    # Включение красной подсветки (индикация ожидания подключения к серверу)
while (requests.get("http://192.168.11.1:627/test")).json() != 1:    # Пока коптер подключается к серверу, не выходит из этого цикла
        set_effect(effect='fill', r=255, g=0, b=0)
        print("[Connect to server...]")
        print((requests.get("http://192.168.11.1:627/test")))    # Вывод сообщения о подключении


set_effect(effect='fade', r=0, g=255, b=0)    # Включение зеленой подсветки (индикация подключения к серверу)

# Словарь для текущей позиции
now = {}

# Взлет на 1 метр и отключение подсветки
navigate_wait(x=0, y=0, z=1, frame_id='body', auto_arm=True, speed=0.5)
set_effect(effect='fade', r=0, g=0, b=0)
def go_to_target():
        # Сохранение текущих параметров в словарь now
        navigate(x=float('nan'), y=float('nan'), z=float('nan'), frame_id='aruco_map')
        now['x'] = get_telemetry('aruco_map').x
        now['y'] = get_telemetry('aruco_map').y
        now['z'] = get_telemetry('aruco_map').z

        # Получение целевого состояние и преобразование json в словарь
        target = requests.get("http://192.168.11.1:627/gettarget", params={"id": 0})
        target_json = target.json()

        # Получение действий для достижения целевого состояния и преобразование json в словарь
        move = requests.get("http://192.168.11.1:627/getmove", params={"id": 0, 'x': now['x'], 'y': now['y'], 'z': now['z']})
        move_json = move.json()

        # Если целевая высота менее 0.1 метра, то посадка и завершение программы, если нет, полет в целевую точку и включение указанной подсветки
        if float(round(target_json['z'])) < 0.1:
                navigate(x=float(round(move_json['move_x'], 2)), y=float(round(move_json['move_y'], 2)), frame_id='body', speed=float(round(move_json['speed'], 2)))
                set_effect(effect='fade', r=0, g=0, b=0)
                land_wait()
                exit(0)
        else:
                navigate(x=float(round(move_json['move_x'], 2)), y=float(round(move_json['move_y'], 2)), z=float(round(move_json['move_z'], 2)), frame_id='body', speed=float(round(move_json['speed'], 2)))
                set_effect(effect='fade', r=move_json['colorRed'], g=move_json['colorGreen'], b=move_json['colorBlue'])

# Постоянное повторение функции go_to_target() (Выход из цикла в случае посадки)
while True:
        go_to_target()

land_wait()