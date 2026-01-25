'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

const UploadingContext = createContext();

export const useUploadingContext = () => useContext(UploadingContext);

export const UploadingProvider = ({ children }) => {
  const [isUploadingVideo1, setIsUploadingVideo1] = useState(false);
  const [isUploadingVideo2, setIsUploadingVideo2] = useState(false);
  const [isUploadingVideo3, setIsUploadingVideo3] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load email from localStorage on mount
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only store email if needed, remove password storage
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
  }, [userEmail]);

  const updateUserCredentials = (email) => {
    setUserEmail(email);
  };

  return (
    <UploadingContext.Provider
      value={{
        isUploadingVideo1,
        setIsUploadingVideo1,
        isUploadingVideo2,
        setIsUploadingVideo2,
        isUploadingVideo3,
        setIsUploadingVideo3,
        userEmail,
        updateUserCredentials,
      }}
    >
      {children}
    </UploadingContext.Provider>
  );
};
