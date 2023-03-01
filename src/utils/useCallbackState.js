import { useEffect, useState } from 'react'

function useCallbackState(od) {
  const [data, setData] = useState(od)
  const [init, setInit] = useState(false)
  const [cb, setCb] = useState(null)
  useEffect(() => {
    if (init) {
      if (cb) {
        if (typeof cb === 'function') {
          cb()
        } else {
          console.warn('Callback is not function')
        }
      }
    }
  }, [data, init, cb])

  return [
    data,
    function (d, callback) {
      setData(d)
      setCb(callback)
      if (!init) {
        setInit(true)
      }
    },
  ]
}

export default useCallbackState
