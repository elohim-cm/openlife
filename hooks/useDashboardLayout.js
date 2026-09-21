import React, { useEffect, useState } from 'react';

const UseDashboardLayout = () => {

  const [accesses, setAccesses] = useState({})

  // get items from session
  const { account, access, role, status } = JSON.parse(localStorage.getItem('accesses'))

  useEffect(() => {
    setAccesses({
      account : account,
      accesses: access,
      role    : role,
      status  : status
    })
  })

  return { accesses }
};

export default UseDashboardLayout;