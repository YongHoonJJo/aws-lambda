import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'

import axios from 'axios'
import { baseURL } from '../apis/api'

const Home = () => {
  const [state, setState] = useState('')
  const [test, setTest] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(baseURL)
        console.log({data})
        setState(data)
      } catch(e) {
        console.log({e})
      }
    }
    fetchData()
  }, [])

  const onClickHandler = () => {
    const obj = {
      a: [1, 2, 3],
      b: [2, 3, 4]
    }
    console.log(obj)
    console.log(JSON.parse(JSON.stringify(obj)))
    setTest(obj)
  }

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={onClickHandler}>
        Hello World
      </Button> 
      {state && <h1>{state}</h1>}
      {test && <div>{test}</div>}
    </React.Fragment>
  )
}

export default Home
