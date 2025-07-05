import {useEffect, useState} from "react";

function FetchData(string){
    const [data, setData] = useState([])
    useEffect(() => {
        fetch(string)
            .then((response) => {
                return response.json();
            }).then((data) => {
            setData(data)
        }).catch((err) => console.error('API Error:', err));

    }, []);
    console.log(data)
    return data;
}
