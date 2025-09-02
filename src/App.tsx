import { useState } from "react";
import { Sudoko, type sudoko } from "./sudoko/sudoko";

export default function App() {
  const [puzzle, setPuzzle] = useState<sudoko>([]);
  const [solution, setSolution] = useState<sudoko>([]);
  const [userBoard, setUserBoard] = useState<sudoko>([]);

  function generateNewGame() {
    const game = new Sudoko();
    const solved = game.generateCompletedBoard();
    const puzzle = game.generatePuzzle(50, true);
    const clone = puzzle.map((r) => r.slice());

    console.log(puzzle);

    // set States
    setPuzzle(puzzle);
    setSolution(solved);
    setUserBoard(puzzle.map((r) => r.slice())); // clone starting state
  }

  function handleValueinput(r: number, c: number, val: string) {
    if (!/^[1-9]$/.test(val)) return; // only 1–9
    const newBoard = userBoard.map((row) => row.slice());
    newBoard[r][c] = parseInt(val, 10);
    setUserBoard(newBoard);
  }

  const checkBoard = () => {
    return userBoard.map((row, r) =>
      row.map((val, c) => {
        if (puzzle[r][c] !== 0) return "prefilled";
        if (val === 0) return "empty";
        return val === solution[r][c] ? "correct" : "wrong";
      })
    );
  };

  const boardStatus = checkBoard();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-orange-100 p-56 rounded-lg">
        {/*Panel for sudoko actions*/}
        <div className="flex items-center justify-between">
         <h2>Sudoko</h2>
         <button onClick={generateNewGame}>Start!</button>
        </div>
        <div>
          <div className="grid grid-rows-9">
            {userBoard.map((row, r) => (
              <div
                key={r}
                className="px-1 py-1 border-2 rounded-sm border-black flex"
              >
                {row.map((value, c) => {
                  const status = boardStatus[r][c];
                  const isPrefilled = puzzle[r][c] !== 0;
                  return (
                    <input
                      key={c}
                      type="text"
                      maxLength={1}
                      disabled={isPrefilled}
                      value={value === 0 ? "" : value}
                      onChange={(e) => handleValueinput(r, c, e.target.value)}
                      className={`w-10 h-10 text-center border
                  ${status === "prefilled" ? "bg-gray-200 font-bold" : ""}
                  ${status === "correct" ? "bg-green-200" : ""}
                  ${status === "wrong" ? "bg-red-200" : ""}
                `}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
