import React, { useState } from 'react'
import axios from 'axios'

import { baseURL } from '../apis/api'

const WordVector = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [vectors, setVectors] = useState('')

  const onChangeHandler = (e) => {
    console.log(e.target.files[0])
    setSelectedFile(e.target.files[0])
  }

  const onClickHandler = async () => {
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      const { data } = await axios.post(`${baseURL}/wordVector`, formData)
      // setVectors(JSON.parse(data))
      console.log({data})
      setVectors(data)
    } catch (e) {
      console.log({e})
    }
  }

  return (
    <div>
      <input type="file" name="file" onChange={onChangeHandler} />
      <button type="button" onClick={onClickHandler}>Submit</button>
      <div>
        {vectors}
      </div>
    </div>
  )
}

export default WordVector
