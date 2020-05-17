from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)


@app.route('/connectedNodes', methods=['POST'])
def connected_nodes():
    update = request.json


if __name__ == '__main__':
    app.run()
