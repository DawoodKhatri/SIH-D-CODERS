from flask import Flask, request,render_template
from flask_cors import CORS
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import subprocess
import os
import json
#Set up Flask:
app = Flask(__name__)
#Set up Flask to bypass CORS:
cors = CORS(app)
#Create the receiver API POST endpoint:

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/transcript", methods=["GET","POST"])
def cript():

    lang = request.files['file'].filename
    audio = request.files['file']
    fl = open('Audio.mp3','wb')
    fl.write(audio.read())
    fl.close()
    if os.path.exists('Audio.wav'):
        os.remove('Audio.wav')
    subprocess.run(["ffmpeg", "-i", 'Audio.mp3', 'Audio.wav'])

    recognizer = sr.Recognizer()
    audio_file = sr.AudioFile('Audio.wav')
    with audio_file as source:
        audio_file = recognizer.record(source)
        result = recognizer.recognize_google(audio_data=audio_file,language=lang)

    if os.path.exists('Audio.mp3'):
        os.remove('Audio.mp3')

    if os.path.exists('Audio.wav'):
        os.remove('Audio.wav')

    return result

@app.route("/translate", methods=["GET","POST"])
def late():

    data = request.data.decode()
    data = json.loads(data)
    translator = Translator()
    output = translator.translate(data["Text"],dest=data["To"],src=data["From"]).text
    
    return output

@app.route("/listen", methods=["GET","POST"])
def listen():

    data = request.data.decode()
    data = json.loads(data)
    Voice = gTTS(data["Text"],lang=data["Lang"])
    Voice.save('Audio.mp3')
    Voice = open('Audio.mp3','rb')
    bytes = Voice.read()
    Voice.close()
    os.remove('Audio.mp3')
    return bytes
    
if __name__ == "__main__": 
    app.run()