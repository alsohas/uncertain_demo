from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

from UncertaintyDemoBackend.GraphProvider import GraphProvider
from UncertaintyDemoBackend.SpatialUtil import SpatialUtil

graphProvider = GraphProvider()
graph = graphProvider.load_graph()

app = Flask(__name__)
CORS(app)


@app.route('/connectedNodes', methods=['POST'])
def connected_nodes():
    update = request.json
    spatial_util = SpatialUtil(update, graph)
    return jsonify(spatial_util.get_connected_nodes())


if __name__ == '__main__':
    app.run()
