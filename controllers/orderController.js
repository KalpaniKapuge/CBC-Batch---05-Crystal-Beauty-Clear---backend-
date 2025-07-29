import { useState } from "react";

export default function TestingPage() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("passed");

  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-80">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">Testing Page</h2>

        <p className="mb-4">Count: {count}</p>
        <button
          onClick={() => setCount(count + 1)}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors mb-4"
        >
          Increment Count
        </button>

        <button
          onClick={() => setCount(count - 1)}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors mb-4"
        >
          Decrement Count
        </button>

        <p className="mb-4">Status: {status}</p>
        <button
          onClick={() => setStatus(status === "passed" ? "failed" : "passed")}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Toggle Status
        </button>
      </div>
    </div>
  );
}
