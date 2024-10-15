const HomeUserGreeting = ({user}) => {
    // user will likely change, for now it will just be JSON of the form
    // {"username": [username]}
    // This will change when more data is returned for the current active user

    return (
        user 
        ? <h1>active user greeting</h1> 
        : <h1>default greeting (no user)</h1>
    )
}

export default HomeUserGreeting
