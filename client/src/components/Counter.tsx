"use client"

import { useState } from "react"

interface CounterProps {
  initialValue?: number
}

export default function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue)

  return (
    <div className="counter">
      <h2>Counter Component</h2>
      <p>Current count: {count}</p>
      <div className="buttons">
        <button onClick={() => setCount(count - 1)}>Decrease</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>Increase</button>
      </div>
    </div>
  )
}
