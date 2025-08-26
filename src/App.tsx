const columns = Array.from({length:9}, (_, i)=>i)
const grids = Array.from({length:9}, (_, i)=>i)

export default function App() {
  return (

    <div className="flex items-center justify-center h-screen">
      <h2 className="bg-black/25 p-25 rounded-lg text-white font-bold text-2xl cursor-pointer">
        Hello World
      </h2>

      <div className="grid grid-cols-3 grid-rows-3">
       {columns.map((_)=>(<div className="px-1 py-1 border-2 rounded-sm border-black grid grid-cols-3 grid-rows-3">
        {grids.map((_)=> (<div className="px-1 py-1 border rounded-sm border-red-50">1</div>) )}
        </div>))}
      </div>
    </div>
  );
}
