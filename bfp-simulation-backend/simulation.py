import heapq
import numpy as np
import gymnasium as gym
from gymnasium import spaces
import cv2

# --- 1. A* Pathfinding Algorithm ---
def a_star_search(grid, start, goal, fire_map=None):
    """Finds the shortest path on a grid using A* search."""
    # Heuristic function (Manhattan distance)
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    # A* algorithm implementation
    neighbors = [(0, 1), (0, -1), (1, 0), (-1, 0)] # 4-directional movement
    close_set = set()
    came_from = {}
    gscore = {start: 0}
    fscore = {start: heuristic(start, goal)}
    oheap = []

    heapq.heappush(oheap, (fscore[start], start))

    while oheap:
        current = heapq.heappop(oheap)[1]

        if current == goal:
            data = []
            while current in came_from:
                data.append(current)
                current = came_from[current]
            data.reverse()
            return data

        close_set.add(current)
        for i, j in neighbors:
            neighbor = current[0] + i, current[1] + j
            tentative_g_score = gscore[current] + 1

            # Check if neighbor is valid
            if 0 <= neighbor[0] < grid.shape[1] and 0 <= neighbor[1] < grid.shape[0]:
                # Check for walls or fire
                if grid[neighbor[1]][neighbor[0]] == 1:
                    continue
                if fire_map is not None and fire_map[neighbor[1]][neighbor[0]] == 1:
                    continue
            else:
                # Neighbor is out of bounds
                continue

            if neighbor in close_set and tentative_g_score >= gscore.get(neighbor, 0):
                continue

            if tentative_g_score < gscore.get(neighbor, 0) or neighbor not in [i[1] for i in oheap]:
                came_from[neighbor] = current
                gscore[neighbor] = tentative_g_score
                fscore[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                heapq.heappush(oheap, (fscore[neighbor], neighbor))

    return [] # Return empty path if no path is found

# --- 2. Fire Simulator Class ---
class FireSimulator:
    def __init__(self, grid, spread_probability=0.25):
        self.grid = grid
        self.spread_probability = spread_probability
        self.fire_map = np.zeros_like(grid)
        self.directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def start_fire(self, ignition_points):
        for y, x in ignition_points:
            if 0 <= y < self.fire_map.shape[0] and 0 <= x < self.fire_map.shape[1]:
                self.fire_map[y, x] = 1

    def step(self):
        new_fire_map = self.fire_map.copy()
        rows, cols = self.fire_map.shape

        # Find all currently burning cells
        burning_cells = np.argwhere(self.fire_map == 1)

        for r, c in burning_cells:
            for dr, dc in self.directions:
                nr, nc = r + dr, c + dc

                if 0 <= nr < rows and 0 <= nc < cols:
                    # Check if neighbor is unburned and not a wall
                    if self.fire_map[nr, nc] == 0 and self.grid[nr, nc] == 0:
                        if np.random.rand() < self.spread_probability:
                            new_fire_map[nr, nc] = 1

        self.fire_map = new_fire_map

    def reset(self):
        self.fire_map = np.zeros_like(self.grid)

# --- 3. Person Agent Class ---
class Person:
    def __init__(self, position):
        self.pos = position
        self.path = []
        self.status = 'evacuating' # evacuating, escaped, burned

    def compute_path(self, grid, goal, fire_map):
        start_pos = (int(self.pos[0]), int(self.pos[1]))
        goal_pos = (int(goal[0]), int(goal[1]))
        self.path = a_star_search(grid, start_pos, goal_pos, fire_map)

    def move(self):
        if self.path:
            # Move to the next point in the path and remove it from the list
            self.pos = self.path.pop(0)

    def check_status(self, fire_map, exits):
        pos_int = (int(self.pos[0]), int(self.pos[1]))
        # Check if burned
        if fire_map[pos_int[1]][pos_int[0]] == 1:
            self.status = 'burned'
        # Check if escaped (close enough to an exit)
        for ex in exits:
            if np.linalg.norm(np.array(self.pos) - np.array(ex)) < 5: # 5 pixel radius for escape
                self.status = 'escaped'

class EvacuationEnv(gym.Env):
    def __init__(self, grid, num_agents=3, max_steps=500):
        super(EvacuationEnv, self).__init__()
        self.grid = grid
        self.num_agents = num_agents
        self.max_steps = max_steps
        self.exits = self._find_exits()
        if not self.exits:
            raise ValueError("No exits found in the provided grid.")

        self.fire_sim = FireSimulator(self.grid)
        self.agents = []

        self.action_space = spaces.Discrete(len(self.exits))

        self.fire_obs_shape = 64 * 64
        self.agent_obs_shape = self.num_agents * 2
        obs_shape = self.fire_obs_shape + self.agent_obs_shape + 1
        self.observation_space = spaces.Box(low=0, high=1, shape=(obs_shape,), dtype=np.float32)

    def _find_exits(self):
        rows, cols = self.grid.shape
        exits = []
        for x in range(cols):
            if self.grid[1, x] == 0: exits.append((x, 1))
            if self.grid[rows-2, x] == 0: exits.append((x, rows-2))
        for y in range(rows):
            if self.grid[y, 1] == 0: exits.append((y, 1))
            if self.grid[y, cols-2] == 0: exits.append((y, cols-2))

        if not exits: return []
        filtered_exits = [exits[0]]
        for ex in exits:
            if all(np.linalg.norm(np.array(ex) - np.array(f_ex)) > 20 for f_ex in filtered_exits):
                filtered_exits.append(ex)
        return filtered_exits

    def _get_observation(self):
        fire_map_resized = cv2.resize(self.fire_sim.fire_map.astype(np.float32), (64, 64), interpolation=cv2.INTER_AREA)
        fire_obs = fire_map_resized.flatten()

        agent_pos = np.array([agent.pos for agent in self.agents]).flatten()
        agent_obs = agent_pos / np.array([self.grid.shape[1], self.grid.shape[0]] * self.num_agents)

        time_obs = np.array([self.current_step / self.max_steps])

        return np.concatenate([fire_obs, agent_obs, time_obs]).astype(np.float32)

    def reset(self, seed=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.fire_sim.reset()
        center_y, center_x = self.grid.shape[0] // 2, self.grid.shape[1] // 2
        self.fire_sim.start_fire([(center_y, center_x)])

        self.agents = []
        while len(self.agents) < self.num_agents:
            y, x = np.random.randint(0, self.grid.shape[0]), np.random.randint(0, self.grid.shape[1])
            if self.grid[y, x] == 0 and self.fire_sim.fire_map[y,x] == 0:
                self.agents.append(Person(position=(x, y)))

        return self._get_observation(), {}

    def step(self, action):
        self.current_step += 1
        self.fire_sim.step()

        target_exit = self.exits[action]
        reward = -0.01

        for agent in self.agents:
            if agent.status == 'evacuating':
                if not agent.path or self.current_step % 10 == 0:
                    agent.compute_path(self.grid, target_exit, self.fire_sim.fire_map)

                agent.move()
                agent.check_status(self.fire_sim.fire_map, self.exits)

                if agent.status == 'escaped':
                    reward += 10
                elif agent.status == 'burned':
                    reward -= 10

        terminated = all(agent.status != 'evacuating' for agent in self.agents)
        truncated = self.current_step >= self.max_steps
        observation = self._get_observation()

        return observation, reward, terminated, truncated, {}
