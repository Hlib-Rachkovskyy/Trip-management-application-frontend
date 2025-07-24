import {useEffect, useState} from "react";
import { PostList } from "../Utils";

export function UserHeader({props}){
    return (<header className="Header">
        <nav>
            <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
            <button className="choice-btn" onClick={() => props.setView('registered')}>Trips on which is
                registered
            </button>
            <button className="choice-btn" onClick={() => props.setView('form')}>Write to organiser
            </button>
        </nav>
    </header>)
}

export function FormPage({ props }) {
    const [company, setCompany] = useState('');
    const [text, setText] = useState('');
    const [companyList, setCompanyList] = useState([])

    const fetchCompanies = async () => {
        fetch('/companies'

        ).then()
            .then(res => res.json())
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            companyName: company,
            text: text,
            userId: props.userId
        };

        try {
            const res = await fetch('/contact-form/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Form submitted successfully.');
                setCompany('');
                setText('');
            } else {
                const msg = await res.text();
                alert('Error: ' + msg);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    return (
        <form className='form-container' onSubmit={handleSubmit}>
            <label htmlFor="company">Choose a company:</label>
            <select
                className='select-container'
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
            >
                <option value="">--Select--</option>
                <option value="company1">company1</option>
                <option value="company2">company2</option>
                <option value="company3">company3</option>
            </select>

            <label htmlFor="form">Text:</label>
            <input
                className='input-container'
                type="text"
                id="form"
                name="form"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
            />
            <br /><br />
            <button className="submit" type="submit">Submit</button>
        </form>
    );
}


export function AnnouncementsReadOnly({props}) {
    const [selectedUser, setSelectedUser] = useState(null);

    const announcements = [{name: 'someGuy', text: 'sometext'}, {name: 'someGuy', text: 'sometext'}]
    return (<div className="announcement">
            {announcements.map(announcement => (
                <div className="announcement-block">
                    <div className="line" onClick={() => {
                        props.setPopup(null)
                    }}>{announcement.name}</div>
                    <div className="line">{announcement.text}</div>
                </div>
            ))}
        </div>
    )
}


export function UserView({props}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getDataBasedOnCurrentTripsView = async (endpoint) => {
        try {
            let data = await fetch(endpoint)
            let jsonData = await data.json();
            setData(jsonData);
        } catch (e) {
            console.log("There's was an error while trying to load view data", data)
        }
        setLoading(false)
    }

    useEffect( () => {
        let endpointString;
        switch (props.view){
            case 'explore':
                endpointString = 'http://localhost:8080/user/1/trips/explore';
                break;
            case 'registered':
                endpointString = 'http://localhost:8080/user/1/trips';
                break;
            default:
                setData([])
                setLoading(false)
                break;
        }
        setLoading(true);
        endpointString && getDataBasedOnCurrentTripsView(endpointString)
    }, [props.blockStateUser, props.view])

    if (loading) return <div>Loading...</div>;
    switch (props.view) {
        case 'form':
            return (<FormPage props={props}/>)
        case 'announcements':
            return (<AnnouncementsReadOnly props={props}/>)
        case 'registered':
            return (<PostList props={props} data={data} />);
        case 'explore':
            return (<PostList props={props} data={data} />);
    }
    return <></>;
}

