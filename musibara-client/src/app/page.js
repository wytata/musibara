import Sidenav from './components/Sidenav';
import  { cookies } from 'next/headers'

const testCookieRetrieve = async () => {
  try {
    const tokenResponse = await fetch("http://localhost:8000/api/users/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        "username": "wyatt",
        "password": "Hyldf7Epoa"
      })
    })
  } catch (err) {
    console.log(err)
  }
  try {
    const response = await fetch("http://localhost:8000/api/users/")
    return response
  } catch (err) {
    console.log(err)
  }
}

const checkSesh = async () => {
  console.log(cookies().getAll())
}

async function App() {
  const res = await testCookieRetrieve()
  console.log(res)
  checkSesh()
  return (
      <div className="App">
        <Sidenav />
      </div>
  );
}

export default App;
