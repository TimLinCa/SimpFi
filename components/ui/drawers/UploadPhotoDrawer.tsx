import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Drawer, DrawerBackdrop, DrawerContent, DrawerBody } from '../drawer'
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UploadPhotoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  OnChooseFromGallery: () => void;
  OnTakePhoto: () => void;
}

const UploadPhotoDrawer: React.FC<UploadPhotoDrawerProps> = ({
  isOpen,
  onClose,
  OnChooseFromGallery,
  OnTakePhoto,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      anchor='bottom'
      onClose={onClose}>
      <DrawerBackdrop />
      <DrawerContent className="w-full h-fit p-0">
        <DrawerBody>
          <TouchableOpacity onPress={OnChooseFromGallery} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
            <MaterialCommunityIcons name="image" size={24} color="black" />
            <Text className='text-xl'>Choose from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={OnTakePhoto} className="gap-3 flex-row items-center hover:bg-background-50 p-2 rounded-md">
            <MaterialCommunityIcons name="camera" size={24} color="black" />
            <Text className='text-xl'>Take a photo</Text>
          </TouchableOpacity>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default UploadPhotoDrawer;