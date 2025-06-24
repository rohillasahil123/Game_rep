import axios from 'axios'
import React, { useEffect } from 'react'

const Demo = () => {

    useEffect(()=>{
        const response = axios.get("https//foodenergy.shop/v1/")
        console.log(response , "demo")
    } , [])


  return (
    <div className='text-4xl'>
        Demi
    </div>
  )
}

export default Demo