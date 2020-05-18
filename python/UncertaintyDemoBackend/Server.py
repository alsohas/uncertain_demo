from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

from UncertaintyDemoBackend.SpatialUtil import get_connected_nodes

app = Flask(__name__)
CORS(app)


@app.route('/connectedNodes', methods=['POST'])
def connected_nodes():
    update = request.json
    return jsonify(get_connected_nodes(update))


if __name__ == '__main__':
    app.run()
