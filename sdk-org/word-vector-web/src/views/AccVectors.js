import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styled from 'styled-components'

import { baseURL } from '../apis/api'

const AccVectors = () => {
  const [vectors, setVectors] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/getAccVector`)
        setVectors(data)
      } catch(e) {
        console.log({e})
      }
    }
    fetchData()
  }, [])

  const isWord = (word) => {
    for(const ch of word)
      if(!(('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z')))
        return false
    return true
  }

  return (
    <div>
      {vectors && Object.keys(vectors).map((word, idx) => {
      return word.length > 1 && isWord(word) && (
        <Wrap key={`${word}`}>
          <WordBox>{word}:</WordBox>
          <VectorBox>{vectors[word].join(' ')}</VectorBox>
        </Wrap>
      )
      })}
    </div>
  )
}

export default AccVectors

const Wrap = styled.div`
  display: inline-flex;
  padding: 10px 0;
`

const WordBox = styled.div`
  width: 150px;
  padding-right: 20px;
`

const VectorBox = styled.div`
  width: 900px;
`