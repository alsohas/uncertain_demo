import osmnx as ox


def get_connected_nodes(update: dict):
    prev_region = update.get('prevRegion', {})
    dist = int(update['dist'])
    lat = float(update['lat'])
    lng = float(update['lng'])
    current_region = {}
    graph = ox.graph_from_point((lat, lng), distance=dist, network_type='drive', simplify=True, truncate_by_edge=True)
    nearest_node = ox.get_nearest_node(graph, (lat, lng))

    # TODO: For multi-step predictive paths, recursively add source nodes to the dict with child node dicts
    # that represent the outgoing edges. Then we can draw the edges for each edge one at a time by iterating through
    # the dictionary (first level is the source nodes), and the sub dictionary (second level would be outgoing edges)
    # TODO: somehow need to keep track of which level of prediction we're at - likely in the frontend side.
    # This is needed to differentiate between the very previous and next step for the set difference.
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

    return current_region


if __name__ == '__main__':
    print(get_connected_nodes({
        'lng': -122.335167,
        'lat': 47.608013,
        'dist': 100
    }))
