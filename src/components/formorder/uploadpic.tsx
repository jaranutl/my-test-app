import React from 'react'
import FileUploader from './Fileuploader'   
import FileUploaderActual from './FileuploaderActual'

export const UploadPic = () => {
    return (
        <div className="flex w-full flex-col">
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploader/></div>
            <div className="divider"></div>
            <div className="card bg-base-200 rounded-box grid h-auto place-items-center"><FileUploaderActual/></div>
        </div>
    )
}
