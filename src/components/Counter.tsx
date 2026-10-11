import { useReducer } from "react";

type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" }
  | { type: "SET_STEP"; payload: number };

interface CounterState {
  count: number;
  step: number;
  min: number;
  max: number;
  initialCount: number;
}

interface CounterProps {
  initialCount?: number;
  step?: number;
  min?: number;
  max?: number;
}

const DEFAULTS = { initialCount: 0, step: 1, min: -Infinity, max: Infinity } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function createInitialState(props: CounterProps): CounterState {
  const initialCount = props.initialCount ?? DEFAULTS.initialCount;
  const min = props.min ?? DEFAULTS.min;
  const max = props.max ?? DEFAULTS.max;

  return {
    count: clamp(initialCount, min, max),
    step: props.step ?? DEFAULTS.step,
    min,
    max,
    initialCount,
  };
}

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: clamp(state.count + state.step, state.min, state.max) };
    case "DECREMENT":
      return { ...state, count: clamp(state.count - state.step, state.min, state.max) };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "RESET":
      return { ...state, count: state.initialCount };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export default function Counter({
  initialCount = 0,
  step = 1,
  min = -Infinity,
  max = Infinity,
}: CounterProps) {
  const [state, dispatch] = useReducer(counterReducer, {
    initialCount,
    step,
    min,
    max,
  }, createInitialState);

  return (
    <section className="card">
      <h2>Counter (useReducer)</h2>
      <p className="counter-value" aria-live="polite">
        {state.count}
      </p>
      <p className="muted">
        step: {state.step} · range: [{state.min === -Infinity ? "-∞" : state.min},{" "}
        {state.max === Infinity ? "∞" : state.max}]
      </p>
      <div className="row">
        <button type="button" onClick={() => dispatch({ type: "DECREMENT" })}>
          −
        </button>
        <button type="button" onClick={() => dispatch({ type: "INCREMENT" })}>
          +
        </button>
        <button type="button" onClick={() => dispatch({ type: "RESET" })}>
          Reset
        </button>
      </div>
      <label className="row">
        <span>Step</span>
        <input
          type="number"
          value={state.step}
          onChange={(event) =>
            dispatch({ type: "SET_STEP", payload: Number(event.target.value) || 1 })
          }
        />
      </label>
    </section>
  );
}
