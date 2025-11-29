import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Inqlusiv Main App</h1>
      <p className="text-lg text-gray-700 mb-6">Frontend setup with React + Tailwind CSS</p>
      
      <div className="p-6 bg-white rounded-xl shadow-md flex items-center space-x-4">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
