import { $path } from 'next-typesafe-url'
import Link from 'next/link'

export default function Home() {
  return (
    <>
    <div>test</div>
    <Link href={$path({route:'/'})} >Link</Link>
    </>
  )
}
