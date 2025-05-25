from collections import defaultdict, deque


class Graph:
    """
    Class to represent a directed graph and perform topological sorting.
    Args:
        graph (List[List[int]]): Adjacency list representation of the graph.
    """

    def __init__(self, graph):
        self.graph = graph

    def is_cyclic(self) -> bool:
        """
        Check if the graph contains a cycle using Kahn's algorithm.
        Returns:
            bool: True if the graph is cyclic, False otherwise.
        """
        V = len(self.graph)

        in_degree = [0] * V

        q = deque()
        visited = 0

        for u in range(V):
            for v in self.graph[u]:
                in_degree[v] += 1

        for u in range(V):
            if in_degree[u] == 0:
                q.append(u)

        while q:
            u = q.popleft()
            visited += 1

            for v in self.graph[u]:
                in_degree[v] -= 1

                if in_degree[v] == 0:
                    q.append(v)

        return visited != V

    def _group_keys_by_value(self, input_dict: dict) -> dict:
        """
        Group dictionary keys by their values.
        Args:
            input_dict (dict): Dictionary to group.
        Returns:
            dict: Dictionary with values as keys and lists of keys as values.
        """
        grouped = defaultdict(list)

        for key, value in input_dict.items():
            grouped[value].append(key)

        return dict(grouped)

    def get_depths(self) -> dict:
        """
        Get the depth of each node in the graph.
        Returns:
            dict: Dictionary with node indices as keys and their depths as values.
        """
        if self.is_cyclic():
            raise ValueError("The graph is cyclic")

        depth = defaultdict(lambda: -1)

        def dfs(node):
            if depth[node] != -1:
                return depth[node]

            max_depth = 0
            for neighbor in self.graph[node]:
                max_depth = max(max_depth, dfs(neighbor))

            depth[node] = max_depth + 1
            return depth[node]

        for node in range(len(self.graph)):
            if depth[node] == -1:
                dfs(node)

        return self._group_keys_by_value(depth)
