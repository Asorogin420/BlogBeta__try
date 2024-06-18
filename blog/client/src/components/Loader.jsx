import React from 'react'
import LoadindGif from '../images/load-8510_256.gif'

const Loader = () => {
  return (
    <div className='loader'>
        <div className="loader__image">
            <img src={LoadindGif} alt="" />
        </div>
    </div>
  )
}

export default Loader