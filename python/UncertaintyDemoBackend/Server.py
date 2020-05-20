from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

from UncertaintyDemoBackend.GraphProvider import GraphProvider
from UncertaintyDemoBackend.RoadNetworkUtil import RoadNetworkUtil
from UncertaintyDemoBackend.SpatialUtil import SpatialUtil

app = Flask(__name__)
CORS(app)


# @app.route('/connectedNodes', methods=['POST'])
# def connected_nodes():
#     update = request.json
#     spatial_util = SpatialUtil(update, graph)
#     return jsonify(spatial_util.get_connected_nodes())


@app.route('/getNodesWithinRange', methods=['POST'])
def get_nodes_in_range():
    info = request.json
    print(info)
    return jsonify(RoadNetworkUtil.getNodesWithinRange(float(info['lat']), float(info['lng']), float(info['radius'])))


if __name__ == '__main__':
    app.run()
