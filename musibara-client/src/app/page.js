"use client"

import Sidenav from './components/Sidenav';

async function App() {
  return (
      <div className="App">
        <Sidenav />
        <button onClick={() => {console.log("hello world")}}>check this out</button>
      </div>
  );
}

export default App;
