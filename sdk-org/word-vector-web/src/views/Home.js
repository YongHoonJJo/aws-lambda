import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'

import axios from 'axios'
import { baseURL } from '../apis/api'

const Home = ({history}) => {
  // const [state, setState] = useState('')
  // const [test, setTest] = useState('')

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const { data } = await axios.get(baseURL)
  //       console.log({data})
  //       setState(data)
  //     } catch(e) {
  //       console.log({e})
  //     }
  //   }
  //   fetchData()
  // }, [])

  return (
    <React.Fragment>
      <a href='http://13.209.123.84:50000/'>
        <Button variant="contained" color="primary" >
          Move to Web NLP Tools
        </Button> 
      </a>
    </React.Fragment>
  )
}

export default Home
