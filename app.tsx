import React, { useState } from "react";
import axios from "axios";

// 盤面サイズ
const defaultSize = 6;

enum CellType {
  Empty = 0,
  Wall = 1,
  Cat = 2,
}

const cellNames = ["空", "壁", "猫"];

export default function App() {
  const [size, setSize] = useState(defaultSize);
  const [currentType, setCurrentType] = useState<CellType>(CellType.Wall);
  const [board, setBoard] = useState<CellType[][]>(
    Array.from({ length: defaultSize }, () =>
      Array(defaultSize).fill(CellType.Empty)
    )
  );
  const [solution, setSolution] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  // サイズ変更時
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(3, Math.min(20, Number(e.target.value)));
    setSize(v);
    setBoard(
      Array.from({ length: v }, () => Array(v).fill(CellType.Empty))
    );
    setSolution(null);
  };

  // セルクリック
  function handleCellClick(x: number, y: number) {
    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      // 猫は1体のみ
      if (currentType === CellType.Cat) {
        for (let j = 0; j < newBoard.length; ++j)
          for (let i = 0; i < newBoard[j].length; ++i)
            if (newBoard[j][i] === CellType.Cat) newBoard[j][i] = CellType.Empty;
      }
      newBoard[y][x] = currentType;
      return newBoard;
    });
    setSolution(null);
  }

  // サーバーAPIに解答リクエスト
  async function handleSolve() {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/solve", {
        board,
      });
      setSolution(res.data.solution);
    } catch {
      alert("APIエラー");
    }
    setLoading(false);
  }

  // セルの見た目
  function renderCell(cell: CellType, x: number, y: number) {
    let color = "#fff";
    if (cell === CellType.Wall) color = "#b39ddb";
    if (cell === CellType.Cat) color = "#ffd54f";
    return (
      <div
        key={x}
        style={{
          width: 36,
          height: 36,
          border: "1px solid #aaa",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => handleCellClick(x, y)}
      >
        {cell === CellType.Empty ? "" : cell === CellType.Wall ? "■" : "🐱"}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>longacat攻略サポート</h2>
      <label>
        サイズ:
        <input
          type="number"
          value={size}
          min={3}
          max={20}
          onChange={handleSizeChange}
          style={{ width: 50, margin: "0 10px" }}
        />
      </label>
      <span>　セル種別:</span>
      {Object.values(CellType)
        .filter((v) => typeof v === "number")
        .map((v) => (
          <button
            key={v as number}
            style={{
              margin: 4,
              background: currentType === v ? "#bbdefb" : "#eee",
              fontWeight: currentType === v ? "bold" : undefined,
            }}
            onClick={() => setCurrentType(v as CellType)}
          >
            {cellNames[v as number]}
          </button>
        ))}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 36px)`,
          margin: "16px 0",
          gap: 2,
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => renderCell(cell, x, y))
        )}
      </div>
      <button onClick={handleSolve} disabled={loading}>
        {loading ? "計算中..." : "解答"}
      </button>
      <div style={{ marginTop: 20 }}>
        {solution && (
          <div>
            <b>解答手順:</b>
            <ol>
              {solution.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}