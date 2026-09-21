import React, { useEffect, useState } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Upload } from '@mui/icons-material';
import Toast from "@/utils/toast";
import ImageService from "@/services/ImageService";
import {BASE_URL} from "@/utils/api/api";
import {useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import AuthService from "@/services/AuthService";

const ImageUpload = ({account, onChangeFile, previewImage, onPreviewImage, authEmail}) => {
    const [selectedImage,setSelectedImage] = useState(null)
    const [open,setOpen] = useState(false)
    // const [imageId, setImageId] = useState(idImage)
    const [isRemove, setIsRemove] = useState(false)
    const {token, authCredentials, image} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const {email} = authCredentials;
    const router = useRouter();
    const context = useAppContext()
    const handleImageChange = (e) => {
        setIsRemove(false)
        const file = e.target.files[0];
        setSelectedImage(file);
        onChangeFile(file);
        (async ()=>{
            try {
                const {data, message} = await ImageService.update(token, account.uid, file)
                Toast.success(message)
                onPreviewImage(data);
                if (authEmail === email){
                    // Update storedValues in local storage
                    let storedValues = JSON.parse(localStorage.getItem("storedValues")) || {};
                    storedValues = {
                        ...storedValues,
                        image: data,
                    };

                    localStorage.setItem("storedValues", JSON.stringify(storedValues));
                }
            }catch (e) {
                AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
                onPreviewImage(null);
            }
        })()
    };

    useEffect(()=>{
        if(isRemove){
            setSelectedImage(null);
            onPreviewImage(null);
        }
    },[isRemove])
    const handleRemoveImage = async ()=>{
        try {
            const response = await ImageService.delete(token, account.uid)
            Toast.success(response)
            setIsRemove(true)
            onChangeFile(null);
            if (authEmail === email){
                // Update storedValues in local storage
                let storedValues = JSON.parse(localStorage.getItem("storedValues")) || {};
                storedValues = {
                    ...storedValues,
                    image: null,
                };

                localStorage.setItem("storedValues", JSON.stringify(storedValues));
            }
        }catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
        }
        setOpen(true)
    }

    return (
        <>
            <Box className={`warpper-uploader ${!previewImage? 'active': ''}`} sx={{
                p: 2 ,
                width: '150px',
                height: '150px',
                position:"relative",
                zIndex: '10',
                borderRadius: '50%',
                backgroundColor: "lightgray",
                '&.active':{
                    overflow: 'hidden'
                }
            }}>
                {previewImage && (
                    <Box  width="100%" height="100%" style={{top:"0px",left:"0px", zIndex:'200', position:"absolute"}}>
                        <Box width="100%" height="100%" position="absolute"
                             style={{
                                overflow:"hidden",
                                borderRadius: '50%',
                                backgroundColor: "var(--lightgray)",
                            }}
                             alignItems={'center'}
                             display={'flex'}
                             justifyContent={'center'}
                        >
                            <img src={`${previewImage}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                        </Box>
                        <Tooltip title='Delete'>
                          <span  style={{position:"absolute", top:"0px",right:"0px", color:"black", zIndex: '100', cursor:"pointer"}}
                                 onClick={handleRemoveImage} >
                            <ClearIcon/>
                          </span>
                        </Tooltip>
                    </Box>
                )}
                <Box position="absolute" sx={{
                    bottom:'0px',
                    left: '50%',
                    width: '100%',
                    transform: 'translate(-50%, 0%)',
                }} className='wrapper-img-btn'>
                    <form encType="multipart/form-data">
                        <input
                            type="file"
                            name={'picture'}
                            accept="image/jpeg, image/jpg, image/png"
                            id="image-upload"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                        {!previewImage ? <label htmlFor="image-upload" style={{width:'100%'}}>
                            <Button variant="contained" className='btn-img' style={{textTransform:"initial", width:'100%',height: '50px'}} component="span">
                                <Upload/>
                            </Button>
                        </label>: null
                        }
                    </form>
                </Box>
            </Box>
        </>
    );
};
export default ImageUpload;