import osmnx as ox


class _GraphProvider:
    def __init__(self, distance=10_000, folder='./'):
        self.location = 'Seattle, USA'
        self.distance = distance
        self.folder = folder
        self.graph = None
        try:
            self.graph = self._load_graph()
        except:
            self.download_graph()

    def download_graph(self):
        dist = self.distance
        location = self.location
        graph = ox.graph_from_address(location, network_type='drive', dist=dist, truncate_by_edge=True)

        ox.save_graphml(graph, f'graph.shp')
        self.graph = graph

    @staticmethod
    def _load_graph():
        graph = ox.load_graphml(f'graph.shp')
        return graph

    @staticmethod
    def truncate(graph, lat, lng, distance, edges=False):
        north, south, east, west = ox.utils_geo.bbox_from_point((lat, lng), dist=distance)
        return ox.truncate.truncate_graph_bbox(graph, north, south, east, west, retain_all=True, truncate_by_edge=edges)

    @staticmethod
    def show_graph(graph):
        ox.plot_graph(graph)


GraphProvider = _GraphProvider()

if __name__ == '__main__':
    gp = GraphProvider
    gp.show_graph(gp.graph)
