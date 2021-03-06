from flask import Flask
from flask import render_template
from flask import request
import json
import shutil

CONFIG = None

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/targetFile', methods = ['GET'])
def getTargetFile():
    fileContent = "File not found."
    with open(CONFIG['target_file'], 'rt') as targetFile:
        fileContent = targetFile.read().decode('UTF-8')
    return fileContent

@app.route('/targetFile', methods = ['POST'])
def saveFile():
    tmpFile = CONFIG['target_file'] + ".tmp"
    succeeded = False
    try:
        with open(tmpFile, 'w') as targetFile:
            targetFile.write(request.form['fileContent'].encode('UTF-8'))
            succeeded = True
    except:
        succeeded = False

    if succeeded:
        shutil.move(tmpFile, CONFIG['target_file'])
        return "0"
    else:
        return "1"

@app.route('/eventLog', methods = ['POST'])
def eventLog():
    succeeded = False
    try:
        with open(CONFIG['event_log'], 'a') as logFile:
            logFile.write(request.form['log'].encode('UTF-8'))
            succeeded = True
    except:
        succeeded = False

    if succeeded:
        return "0"
    else:
        return "1"

if __name__ == "__main__":
    with open("./config.json", 'rt') as configFile:
        CONFIG = json.loads(configFile.read())
    app.run(host="0.0.0.0", debug=True)
