import reset from 'styled-reset'
import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  ${reset};
  html, body, #root {
    height: 100%
  }
  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
    line-height: 1.2;
  }
`