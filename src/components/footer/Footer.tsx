import React from 'react'

const thisyear = new Date().getFullYear();

export const Footer = () => {
    return (
        <div>
            <div className="box-border h-16 w-full border-t border-gray-300 flex items-center justify-center">
                <div className='columns-3'>
                    <div className='text-center text-sm text-gray-600'>&copy; {thisyear} ถั่วหวาน. All rights reserved.</div>
                    <div className='text-center text-sm text-gray-600'>ติดต่อเรา:
                        <a href="mailto: sweetp@gmail.com" className='text-blue-500 hover:underline ml-1'>
                            sweetp@gmail.com
                        </a>
                    </div>
                    <div className='text-center text-sm text-gray-600'>Powered by Next.js from Job and Ohmyim</div>
                </div>
            </div>
        </div>
    )
}
