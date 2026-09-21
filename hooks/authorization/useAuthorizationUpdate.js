// update authorization
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTHORIZATION_LISTING_PAGE } from "@/utils/routes/routes";
import { updateAuthorization } from "@/services/habilitationService";

const useAuthorizationUpdate = (data, authorizationUid) => {

  const [showAlert, setShowAlert] = useState(false)
  const [authorizationExist, setAuthorizationExist] = useState(false)

  const router = useRouter()

  useEffect(() => {
    // user token
    const token = localStorage.getItem('token')
    // user role
    const role = localStorage.getItem('selectedRole')
  }, [])

  useEffect(() => {

    if (showAlert) {
      //  remove the error alert message
      setAuthorizationExist(false)

      const timer = setTimeout(() => {
        // redirect to login page
        router.push(AUTHORIZATION_LISTING_PAGE)
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert, router]);

  return { showAlert, authorizationExist }
}

export default useAuthorizationUpdate