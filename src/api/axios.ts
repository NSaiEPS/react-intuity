import axios from "axios";
import secureLocalStorage from "react-secure-storage";

export const BASE_URL = "https://test-intuity-backend.pay.waterbill.com/"; //ETNYRE BACKEND BASE_URL
// export const UserDetails = JSON.parse(localStorage.getItem('intuity-user'));

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Ismobile: '1',
    Accept: "application/json",
    // Authorization: `Bearer ${UserDetails?.token}`,
    // Authorization: `Bearer ${UserDetails?.token}`,
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NjksImV4cCI6MTc0ODUyNzcwMn0=.ge9PhZ55G/9rF6oR6jwa98WcKpgWHR5P74KK/ZK7hQU=
    // Authorization: `${UserDetails?.token}`,
  },
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 && error.config.url !== "users/login") {
      // Redirect to login page
      // message.info("Session Expired");
      // localStorage.clear();
      secureLocalStorage.clear();

      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default api;
