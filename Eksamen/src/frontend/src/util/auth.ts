import { useLocalStorage } from 'usehooks-ts'

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('userLogged', false)

  const logOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("userName")
  };

  const logIn = (username: string) => {
    setIsLoggedIn(true);
    localStorage.setItem("userName", username)
  };

  return { isLoggedIn, logOut, logIn };
};
