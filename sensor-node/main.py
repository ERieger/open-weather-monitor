import network
import time
from machine import Pin
from machine import RTC
from umqtt.simple import MQTTClient
import dht
import secrets
import json
import utime

rtc = RTC()
# year, month, day, weekday, hours, minutes, seconds, subseconds
# weekday is 1-7 for Monday through Sunday.
# subseconds counts down from 255 to 0
rtc.datetime((2022, 9, 21, 3, 11, 3, 39, 0))
print(rtc.datetime())
print(utime.gmtime())

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(secrets.SSID, secrets.PASSWORD)

while wlan.isconnected() == False:
    print('Waiting for connection...')
    time.sleep(1)

print(wlan.isconnected())

station_id = "7e95045d-4f0e-41d5-9d8d-6317bbd0cc30"
d = dht.DHT22(Pin(2))

mqtt_server = "10.1.1.12"
topic_pub = b"nodes/reports/" + station_id
#topic_msg = b"{data}".format(data = json.dumps(report))

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
    # Define report
    report = {
        "stationId": station_id,
        "time": utime.mktime(utime.gmtime()),
        "wind": {
            "speed": 25,
            "direction": 300,
            "gust": 30,
            "gust_direction": 180
        },
        "rainfall": 5,
        "temperature": None,
        "pressure": 1040,
        "relHumidity": None,
        "light": 40,
        "system": {
            "battery": 97
        }
    }
    
    # Get temperature/humidity
    d.measure()
    report["temperature"] = d.temperature()
    report["relHumidity"] = d.humidity()
    
    encoded = json.dumps(report).encode()
    print(encoded)
    return encoded

try:
    client = mqtt_connect()
except OSError as e:
    reconnect()

while True:
    client.publish(topic_pub, report())
    time.sleep(10)


