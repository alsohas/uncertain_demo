import osmnx as ox


class GraphProvider:
    def __init__(self, distance=10_000, folder='./'):
        self.location = 'Seattle, USA'
        self.distance = distance
        self.folder = folder
        self.graph = None

    def download_graph(self):
        dist = self.distance
        location = self.location
        folder = self.folder
        graph = ox.graph_from_address(location, network_type='drive', distance=dist, truncate_by_edge=True)

        ox.save_graphml(graph, filename=f'graph.shp', folder=folder)
        self.graph = graph

    @staticmethod
    def load_graph():
        graph = ox.load_graphml(filename=f'graph.shp', folder='./')
        return graph

    @staticmethod
    def truncate(graph, lat, lng, distance, edges=False):
        north, south, east, west = ox.bbox_from_point((lat, lng), distance)
        return ox.truncate_graph_bbox(graph, north, south, east, west, retain_all=True, truncate_by_edge=edges)

    @staticmethod
    def show_graph(graph):
        ox.plot_graph(graph)


if __name__ == '__main__':
    gp = GraphProvider()
    gp.show_graph(gp.load_graph())
