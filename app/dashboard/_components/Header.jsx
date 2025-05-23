"use client"
import Image from 'next/image'
import React, { useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const Header=()=> {
  const path=usePathname();
  useEffect(()=>{
    console.log(path);
  },[]);

  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
<Link href="/">
        <Image src={'/Bot.png'} width={60} height={100} alt='logo' />
      </Link>      <ul className='hidden md:flex gap-6'>
        <Link href="/dashboard">
          <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard'&&'text-primary font-bold'}`}>Dashboard</li>
        </Link>
        <Link href="/dashboard">
          <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard/questions'&&'text-primary font-bold'}`}>Questions</li>
        </Link>
        <Link href="/dashboard/upgrade">
          <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path=='/dashboard/upgrade'&&'text-primary font-bold'}`}>Upgrade</li>
        </Link>
      </ul>
      <UserButton/>
    </div>
  )
}

export default Header
