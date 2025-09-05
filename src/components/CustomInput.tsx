import React from "react";

interface Props {
  r: number;
  c: number;
  status: string;
  value: number;
  isPrefilled: boolean;
  board: (HTMLDivElement | null)[][];
  func: (r: number, c: number, val: string) => void;
}

export default function CustomInput({
  r,
  c,
  board,
  status,
  value,
  isPrefilled,
  func,
}: Props) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isPrefilled) return;
    func(r, c, e.key);
  };

  return (
    <div
      ref={(el) => {
        if (el) {
          if (!board[r]) board[r] = [];
          board[r][c] = el;
        }
      }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="button"
      className={`w-10 h-10 flex items-center justify-center border rounded-sm 
        ${status === "prefilled" ? "bg-gray-200 font-bold" : ""}
        ${status === "correct" ? "bg-green-200" : ""}
        ${status === "wrong" ? "bg-red-200" : ""}`}
    >
      {value === 0 ? "" : value}
    </div>
  );
}
