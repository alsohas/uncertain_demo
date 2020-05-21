from flask import Flask, request, jsonify
from flask_cors import CORS

from UncertaintyDemoBackend.RoadNetworkUtil import RoadNetworkUtil

app = Flask(__name__)
CORS(app)


@app.route('/getNodesWithinRange', methods=['POST'])
def get_nodes_in_range():
    info = request.json
    print(info)
    return jsonify(RoadNetworkUtil.get_nodes_within_range(float(info['lat']), float(info['lng']), float(info['radius'])))


if __name__ == '__main__':
    app.run()
