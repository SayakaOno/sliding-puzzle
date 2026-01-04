// Adapted from the React Image Crop CodeSandbox demo:
// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FuseDebounceEffect.ts%3A1%2C1-18%2C1
import { useEffect, type DependencyList } from 'react'

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn();
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}
