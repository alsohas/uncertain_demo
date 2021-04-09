from GraphProvider import GraphProvider


class RoadNetworkUtil:
    @staticmethod
    def get_nodes_within_range(lat, lng, radius):
        graph = GraphProvider.graph
        graph = GraphProvider.truncate(graph, lat, lng, radius)
        nodes = []
        for n in graph.nodes:
            nodes.append(n)
        return nodes
