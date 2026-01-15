import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.scss';
import Toolbar from '../components/Toolbar/Toolbar';

export default function MyApp({ Component, pageProps, router }) {
  const isCalendarPage = router?.pathname === '/visits/calendar';
  return (
    <>
      <Toolbar />
      {isCalendarPage ? (
        <Component {...pageProps} />
      ) : (
        <div className="app-frame">
          <div className='app-container'>
            <Component {...pageProps} />
          </div>
        </div>
      )}
    </>
  );
}
