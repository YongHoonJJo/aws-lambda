import React, { useState } from 'react'
import axios from 'axios'

import { baseURL } from '../apis/api'
import Input from '../styles/Input'
import Radio from '../styles/Radio'

const WordVector = () => {
  const [selectedFile, setSelectedFile] = useState('')
  const [vectors, setVectors] = useState('')
  const [dims, setDims] = useState(10)
  const [model, setModel] = useState({
    options: [{
      value: 'CBOW',
      label: 'CBOW'
    }, {
      value: 'Skip Gram',
      label: 'Skip Gram'
    }],
    name: 'model',
    currentValue: 'CBOW'
  })

  const onChangeHandler = (e) => {
    console.log(e.target.files[0])
    setSelectedFile(e.target.files[0])
  }

  const onChangeDims = (e) => {
    console.log(e.target.value)
    setDims(e.target.value)
  }

  const onChangeModel = (selected) => {
    setModel({...model, currentValue: selected}) 
  }

  const onClickHandler = async () => {
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('dims', dims)
    formData.append('model', model.currentValue)
    try {
      const { data } = await axios.post(`${baseURL}/wordVector`, formData)
      setVectors(data)
    } catch (e) {
      console.log({e})
    }
  }

  return (
    <div>
      <Input label="차원" type="text" name="dims" value={dims} onChange={onChangeDims}/>
      <Radio label="Model" currentValue={model.currentValue} name={model.name} options={model.options} onChange={onChangeModel} />
      <input type="file" name="file" onChange={onChangeHandler} />
      <button type="button" onClick={onClickHandler}>Submit</button>
      <div>
        {vectors}
      </div>
    </div>
  )
}

export default WordVector
