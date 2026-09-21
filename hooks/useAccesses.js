'use client'

import React, { useEffect, useState } from 'react';

const useAccesses = () => {

  // access state
  const [roles, setRoles] = useState(null)
  const [userName, setUserName] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // get the user role form local storage
    const localRoles = JSON.parse(localStorage.getItem('roles'))

    //  get the username
    const userName = localStorage.getItem('lastName')

    //  get the user token
    const userToken = localStorage.getItem('token')

    setRoles(localRoles)
    setUserName(userName)
    setToken(userToken)

  }, [])

  return { roles, userName, token }
};

export default useAccesses;