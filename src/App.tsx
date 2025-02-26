import InfiniteMenu from './block/Components/InfiniteMenu/InfiniteMenu'
import { useEffect, useState } from "react";
import axios from "axios";

interface UserData {
  image: string;
  link: string;
  title: string;
  description: string;
}

function App() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/data")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching data:", err));

    const storedUser = localStorage.getItem("githubUser");
    if (storedUser) setLoggedIn(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("githubUser");
      setLoggedIn(!!storedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get("user");

    if (userParam) {
      localStorage.setItem("githubUser", userParam);
      setLoggedIn(true);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className='h-full w-full'>
        <InfiniteMenu items={users} />
      </div>
      {!loggedIn && (
        <a href="http://localhost:5000/auth/github" className='absolute top-2 right-2'>
          <button className="px-4 py-2 bg-zinc-800 text-white rounded">Sign in with GitHub</button>
        </a>
      )}
    </div>
  )
}

export default App
