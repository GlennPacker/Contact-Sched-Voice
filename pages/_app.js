import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.scss'
import Toolbar from '../components/Toolbar/Toolbar'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Toolbar />
      <div className="app-frame">
        <div className='app-container'>
          <Component {...pageProps} />
        </div>
      </div>
    </>
  )
}
