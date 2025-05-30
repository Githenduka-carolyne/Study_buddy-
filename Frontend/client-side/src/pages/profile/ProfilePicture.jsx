import React, { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useAuth } from '../../context/AuthContext';
import imageCompression from 'browser-image-compression';

const ProfilePicture = ({ onClose }) => {
  const { user, updateProfilePicture } = useAuth();
  const [image, setImage] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compress image before cropping
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setError('Error processing image. Please try again.');
    }
  };

  const handleCrop = async () => {
    if (!cropper) return;

    try {
      setLoading(true);
      setError('');

      // Get cropped image as blob
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
      });

      const blob = await new Promise((resolve) => {
        croppedCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
      });

      // Create form data
      const formData = new FormData();
      formData.append('profilePicture', blob, 'profile.jpg');

      // Upload to server
      const response = await fetch('http://localhost:5001/api/users/profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        await updateProfilePicture(data.profilePicture);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to update profile picture');
      }
    } catch (error) {
      setError(error.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5001/api/users/profile-picture', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        await updateProfilePicture(null);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      setError(error.message || 'Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Profile Picture</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {image ? (
            <div className="aspect-square overflow-hidden rounded-lg">
              <Cropper
                src={image}
                style={{ height: 400, width: '100%' }}
                aspectRatio={1}
                guides={false}
                onInitialized={(instance) => setCropper(instance)}
                viewMode={1}
                dragMode="move"
                scalable={false}
                zoomable={false}
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Current profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400">
                  <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {image ? 'Choose Different Image' : 'Upload Image'}
            </button>

            {user?.profilePicture && !image && (
              <button
                onClick={handleRemove}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>

          {image && (
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setImage(null)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;
