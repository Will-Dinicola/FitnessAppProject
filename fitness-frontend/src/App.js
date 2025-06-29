import { useState, useEffect } from "react";

function TestFunction() {
    // This line sets data to null, and says that setData will be the setter
    const [data, setData] = useState(null);

    // useEffect takes 2 args: 1st is the function to run, 2nd is when to re-run it
    useEffect(() => {
        // First arg: fetch data, convert to JSON, then set state
        fetch("http://localhost:5000/api/data")
            .then((res) => res.json())
            .then((data) => setData(data.message));
    }, []); // Second arg: empty array = run only once

    // Line reads: if data is true, show it; else show "Not loaded"
    return <div>{data ? data : "Not loaded"}</div>;
}

function App() {
    //jsx
    return (
        <div>
            {/* render the text */}
            <h1>Fitness App</h1>
            {/* render the testFunction component */}
            <TestFunction />
        </div>
        // Ends what to return
    );
    // Ends the app component
}

// allows for index.js file to find this component
export default App;