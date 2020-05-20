from typing import List

import osmnx as ox

from UncertaintyDemoBackend.GraphProvider import GraphProvider


class SpatialUtil:
    graph = None

    def __init__(self, update: dict, graph):
        self.update = update['update']
        self.predictive_steps = int(update['predictiveStep'])
        self.dist = int(update['dist'])
        self.source_lat = float(update['lat'])
        self.source_lng = float(update['lng'])
        self.prev_region = set(update.get('prevRegion', []))
        self.current_region = {}
        self.graph = graph
        self.predictive_regions = {}
        self.visited_edges = set()

    def _build_predictive_regions(self, graph, source_node_id, kept_nodes, deleted_nodes):
        if source_node_id in deleted_nodes:
            return
        for e in graph.edges:
            if e[0] != source_node_id and e[1] != source_node_id:
                continue
            if e[0] not in kept_nodes or e[1] not in kept_nodes:
                continue
            source = graph.nodes[source_node_id]
            destination = graph.nodes[e[0]] if e[0] != source else graph.nodes[e[1]]

            if destination['osmid'] in deleted_nodes:
                continue
            if self.prev_region and destination['osmid'] not in self.prev_region:
                continue
            # self.visited_edges.add((source_node_id, destination['osmid']))
            possible_path = self.current_region.get(source.get('osmid'), {})
            possible_path[destination['osmid']] = {
                'lat': destination['y'],
                'lng': destination['x'],
                'id': destination['osmid']
            }
            if source.get('osmid') not in possible_path:
                possible_path[source.get('osmid')] = {
                    'lat': source['y'],
                    'lng': source['x'],
                    'id': source['osmid']
                }
            self.current_region[source.get('osmid')] = possible_path

    def get_connected_nodes(self):
        deleted_nodes = self._build_next_region()
        return {
            'keptNodes': self.current_region,
            'deleted_nodes': list(deleted_nodes)
        }

    def _build_next_region(self):
        current_region_graph_no_edges = GraphProvider.truncate(self.graph, self.source_lat, self.source_lng, self.dist)
        current_region_graph_edges = GraphProvider.truncate(self.graph, self.source_lat,
                                                            self.source_lng, self.dist, edges=True)
        possible_current_nodes = set(current_region_graph_no_edges.nodes)
        previous_nodes = self.prev_region
        print('previous_nodes')
        print(previous_nodes)
        kept_nodes = set()
        for e in current_region_graph_edges.edges:
            # keep nodes if both in region for first region
            if not previous_nodes:
                if e[0] in possible_current_nodes:
                    kept_nodes.add(e[0])
                if e[1] in possible_current_nodes:
                    kept_nodes.add(e[1])

            elif (e[0] in possible_current_nodes and e[1] in previous_nodes) \
                    or (e[0] in previous_nodes and e[1] in possible_current_nodes):
                kept_nodes.add(e[0])
                kept_nodes.add(e[1])

        deleted_nodes_current = possible_current_nodes.difference(kept_nodes)
        deleted_nodes_prev = previous_nodes.difference(kept_nodes)
        deleted_nodes = deleted_nodes_current.union(deleted_nodes_prev)

        for node_id in current_region_graph_no_edges:
            self._build_predictive_regions(current_region_graph_edges, node_id, kept_nodes, deleted_nodes)

        return deleted_nodes


if __name__ == '__main__':
    opts = {"lat": 47.60767912000021, "lng": -122.33594159531549, "dist": "100", "predictiveStep": "2", "update": 1,
            "prevRegion": []}
    util = SpatialUtil(opts, GraphProvider().load_graph())
    print(util.get_connected_nodes())
