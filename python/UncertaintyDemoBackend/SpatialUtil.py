import osmnx as ox


def get_connected_nodes(update: dict):
    # {'lat': 47.6090274819287, 'lng': -122.33214602173831, 'update': 5}
    lng = update['lng']
    lat = update['lat']
    dist = update['dist']
    prev_region = update.get('prevRegion', {})
    current_region = {}
    graph = ox.graph_from_point((lat, lng), network_type='drive', simplify=True, truncate_by_edge=True, distance=dist)
    nearest_node = ox.get_nearest_node(graph, (lat, lng))

    for e in graph.edges:
        if e[0] != nearest_node and e[1] != nearest_node:
            continue
        source = graph.nodes[nearest_node]
        dest = graph.nodes[e[0]] if e[0] != source else graph.nodes[e[1]]
        if dest['osmid'] in prev_region:
            continue
        possible_path = current_region.get(source.get('osmid'), {})
        possible_path[dest.get('osmid')] = {
            'lat': dest['y'],
            'lng': dest['x'],
            'id': dest['osmid']
        }
        if source.get('osmid') not in possible_path:
            possible_path[source.get('osmid')] = {
                'lat': source['y'],
                'lng': source['x'],
                'id': source['osmid']
            }
        current_region[source.get('osmid')] = possible_path

    print(current_region)


if __name__ == '__main__':
    get_connected_nodes({
        'lng': -122.335167,
        'lat': 47.608013,
        'dist': 100
    })
