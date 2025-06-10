from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class BoardRequest(BaseModel):
    board: List[List[int]]

@app.post("/solve")
def solve(req: BoardRequest):
    board = req.board
    N = len(board)
    cat_pos = [(x, y) for y in range(N) for x in range(N) if board[y][x] == 2]
    if not cat_pos:
        return {"solution": ["猫が未配置です"]}
    sx, sy = cat_pos[0]
    from collections import deque
    dirs = [(0, -1, "↑"), (0, 1, "↓"), (-1, 0, "←"), (1, 0, "→")]
    need_fill = sum(1 for y in range(N) for x in range(N) if board[y][x] == 0)
    from copy import deepcopy
    queue = deque()
    start_filled = [[False]*N for _ in range(N)]
    queue.append( (sx, sy, deepcopy(start_filled), []) )
    visited = set()
    def fill(filled, x, y, dx, dy):
        tx, ty = x, y
        temp = [row[:] for row in filled]
        moved = False
        while True:
            nx, ny = tx + dx, ty + dy
            if not (0 <= nx < N and 0 <= ny < N):
                break
            if board[ny][nx] == 1 or temp[ny][nx]:
                break
            tx, ty = nx, ny
            temp[ty][tx] = True
            moved = True
        return tx, ty, temp, moved
    while queue:
        x, y, filled, path = queue.popleft()
        key = (x, y, tuple(tuple(row) for row in filled))
        if key in visited:
            continue
        visited.add(key)
        fill_count = sum(1 for j in range(N) for i in range(N) if board[j][i]==0 and filled[j][i])
        if fill_count == need_fill:
            return {"solution": path}
        for dx, dy, name in dirs:
            nx, ny, new_filled, moved = fill(filled, x, y, dx, dy)
            if moved:
                queue.append( (nx, ny, new_filled, path + [name]) )
    return {"solution": ["解なし"]}