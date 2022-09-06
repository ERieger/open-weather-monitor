import network
import time
from machine import Pin
from umqtt.simple import MQTTClient
import dht
import secrets
import json

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(secrets.SSID, secrets.PASSWORD)

time.sleep(5)
print(wlan.isconnected())

station_id = "7e95045d-4f0e-41d5-9d8d-6317bbd0cc30"
d = dht.DHT22(Pin(2))

report = {
    "stationId": station_id,
    "time": "Tue Sep 06 2022 12:48:52 GMT+0930 (Australian Central Standard Time)",
    "wind": {
        "speed": 15,
        "direction": 300,
        "gust": 30,
        "gust_direction": 180
    },
    "rainfall": 5,
    "temperature": 10,
    "pressure": 1040,
    "humidity": 87,
    "light": 40,
    "system": {
        "battery": 97
    }
}

mqtt_server = "10.1.1.12"
topic_pub = b"nodes/reports/" + station_id
topic_msg = b"{data}".format(data = json.dumps(report))
#topic_msg = b"test"

def mqtt_connect():
    client = MQTTClient(station_id, mqtt_server, keepalive=3600)
    client.connect()
    print("Connected to %s MQTT Broker"%(mqtt_server))
    return client

def reconnect():
    print("Failed to connect to the MQTT Broker. Reconnecting...")
    time.sleep(5)
    machine.reset()

def report():
    d.measure()
    temp = d.temperature()
    hum = d.humidity()
    print("Temperature: {}°C   Humidity: {:.0f}% ".format(temp, hum))
    sleep(2)
    return d.measure

try:
    client = mqtt_connect()
except OSError as e:
    reconnect()

while True:
    client.publish(topic_pub, topic_msg)
    time.sleep(10)


