"use client"
import { useParams } from 'next/navigation'


const GetById = () => {
    const { id } = useParams()
    console.log(id)
  return (
    <div>GetById</div>
  )
}

export default GetById