import { useMachine } from '@xstate/react'
import React from 'react'
import { ActorRef, assign, createMachine, sendParent, spawn } from 'xstate'

interface parentContext {
  count: number
  incRef?: ActorRef<any>
  decRef?: ActorRef<any>
}

const incrementMachine = createMachine({
  initial: 'ready',
  states: {
    ready: {
      on: {
        CLICK: { actions: sendParent({ type: 'INCREMENT' }) },
      },
    },
  },
})

const decrementMachine = createMachine({
  initial: 'ready',
  states: {
    ready: {
      on: {
        CLICK: { actions: sendParent({ type: 'DECREMENT' }) },
      },
    },
  },
})

const parentMachine = createMachine<parentContext>({
  initial: 'idle',
  context: {
    count: 0,
  },
  states: {
    idle: {
      entry: assign<parentContext>({
        incRef: () => spawn(incrementMachine),
        decRef: () => spawn(decrementMachine),
      }),
      on: {
        INCREMENT: {
          actions: assign({ count: ({ count }) => count + 1 }),
        },
        DECREMENT: {
          actions: assign({ count: ({ count }) => count - 1 }),
        },
      },
    },
  },
})

const IncDecButton = ({ onClick, label }: any) => {
  return <button onClick={onClick}>{label}</button>
}

function App() {
  const [current] = useMachine(parentMachine)

  return (
    <div className="App" data-testid="app-page">
      Count: {current.context.count}
      <IncDecButton
        onClick={() => current.context.incRef?.send('CLICK')}
        label="+"
      />
      <IncDecButton
        onClick={() => current.context.decRef?.send('CLICK')}
        label="-"
      />
    </div>
  )
}

export default App
