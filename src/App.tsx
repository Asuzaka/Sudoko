import { useEffect, useMemo, useRef, useState } from "react";
import { Sudoko, type sudoko } from "./sudoko/sudoko";
import CustomInput from "./components/CustomInput";

const SIZE = 9;

export default function App() {
  const puzzleRef = useRef<sudoko>([]);
  const solutionRef = useRef<sudoko>([]);
  const [userBoard, setUserBoard] = useState<sudoko>([]);
  const boardDivs = useRef<(HTMLDivElement | null)[][]>([]);
  const [active, setActive] = useState({ row: 0, column: 0 });

  //  Helper for cloning a board
  const cloneBoard = (board: sudoko) => board.map((r) => [...r]);

  function generateNewGame() {
    const game = new Sudoko();
    const solved = game.generateCompletedBoard();
    const puzzle = game.generatePuzzle(50, true);

    puzzleRef.current = puzzle;
    solutionRef.current = solved;
    setUserBoard(cloneBoard(puzzle));
  }

  function handleValueInput(r: number, c: number, val: string) {
    if (!/^[1-9]$/.test(val)) return;
    setUserBoard((prev) => {
      const newBoard = cloneBoard(prev);
      newBoard[r][c] = parseInt(val, 10);
      return newBoard;
    });
  }

  //  Compute board status only when relevant data changes
  const boardStatus = useMemo(() => {
    const puzzle = puzzleRef.current;
    const solution = solutionRef.current;
    return userBoard.map((row, r) =>
      row.map((val, c) => {
        if (puzzle[r][c] !== 0) return "prefilled";
        if (val === 0) return "empty";
        return val === solution[r][c] ? "correct" : "wrong";
      })
    );
  }, [userBoard]);

  //  Global navigation via arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setActive(({ row, column }) => {
        if (e.key === "ArrowUp" && row > 0) return { row: row - 1, column };
        if (e.key === "ArrowDown" && row < SIZE - 1)
          return { row: row + 1, column };
        if (e.key === "ArrowLeft" && column > 0)
          return { row, column: column - 1 };
        if (e.key === "ArrowRight" && column < SIZE - 1)
          return { row, column: column + 1 };
        return { row, column };
      });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  //  Focus active cell
  useEffect(() => {
    const { row, column } = active;
    const target = boardDivs.current[row]?.[column];
    if (target) target.focus();
  }, [active]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-orange-100 p-10 rounded-lg">
        {/* Panel for sudoku actions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Sudoko</h2>
          <button
            onClick={generateNewGame}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Start!
          </button>
        </div>
        <div className="grid grid-rows-9 gap-1">
          {userBoard.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((value, c) => {
                const status = boardStatus[r][c];
                const isPrefilled = puzzleRef.current[r][c] !== 0;
                return (
                  <CustomInput
                    key={c}
                    r={r}
                    c={c}
                    value={value}
                    status={status}
                    isPrefilled={isPrefilled}
                    board={boardDivs.current}
                    func={handleValueInput}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
