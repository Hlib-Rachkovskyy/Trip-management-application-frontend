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

export function FormPage({ props }) { // make empty not
    const [loading, setLoading] = useState(false)
    const [companyList, setCompanyList] = useState([])
    const [userText, setUserText] = useState('');
    const [currentCompanyId, setCurrentCompanyId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const data = await fetch("/companies");
            const jsonData = await data.json();
            setCompanyList(jsonData);
            setCurrentCompanyId(jsonData[0].id)
            setLoading(false)
        }

        fetchData()

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            text: userText,
            userId: props.currentUserId,
            companyId: currentCompanyId,
            sendDate: Date.now()
        };

        try {
            setLoading(true)
            const res = await fetch('/contact-form/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });



            if (res.ok) {
                alert('Form submitted successfully.');
                setLoading(false);
            } else {
                const msg = await res.text();
                alert('Error: ' + msg);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };




    if (loading) return <p>Loading...</p>
    else return (
        <form className='form-container' onSubmit={handleSubmit}>
            <label htmlFor="company">Choose a company:</label>
            <select
                className='select-container'
                id="company"
                name="company"
                value={currentCompanyId}
                onChange={(e) => setCurrentCompanyId(e.target.value)}
                required
            >
                {companyList.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                ))}
            </select>
            <label htmlFor="form">Text:</label>
            <input
                className='input-container'
                type="text"
                id="form"
                name="form"
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                required
            />
            <br /><br />
            <button className="submit" type="submit">Submit</button>
        </form>
    );
}


export function AnnouncementsReadOnly({props}) {
    const [tripData, setTripData] = useState(null);
    const [managerData, setManagerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get trip with announcements using associations
                const tripResponse = await fetch(`/trip/${props.currentTripId || 1}/announcements`);
                const trip = await tripResponse.json();
                setTripData(trip);

                // Get trip with manager using associations
                const managerResponse = await fetch(`/trip/${props.currentTripId || 1}/manager`);
                const tripWithManager = await managerResponse.json();
                setManagerData(tripWithManager);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.currentTripId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="announcements-readonly">
            <h3>Announcements</h3>
            
            {managerData?.tripManager?.[0] && (
                <div className="manager-info">
                    <h4>Trip Manager</h4>
                    <p>Name: {managerData.tripManager[0].name} {managerData.tripManager[0].surname}</p>
                    <p>Email: {managerData.tripManager[0].email}</p>
                    <p>Phone: {managerData.tripManager[0].phoneNumber}</p>
                </div>
            )}

            <div className="announcements-list">
                {tripData?.announcement?.map(announcement => (
                    <div key={announcement.id} className="announcement-card">
                        <p className="announcement-date">{announcement.announcementDate}</p>
                        <p className="announcement-content">{announcement.content}</p>
                    </div>
                )) || <p>No announcements yet</p>}
            </div>
        </div>
    );
}


export function UserView({props}) {
    const [userData, setUserData] = useState(null);
    const [allTrips, setAllTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await fetch('/user/1/trips');
                const user = await userResponse.json();
                setUserData(user);
                console.log(user)

                const tripsResponse = await fetch('/trips');
                const trips = await tripsResponse.json();
                setAllTrips(trips);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.blockStateUser]);

    if (loading) return <div>Loading...</div>;


    let displayData = [];
    
    switch (props.view) {
        case 'explore':
            const userTripIds = userData?.userInTripList?.map(uit => uit.trip.id) || [];
            displayData = allTrips.filter(trip => !userTripIds.includes(trip.id));
            break;
        case 'registered':
            displayData = userData?.userInTripList?.map(uit => ({
                ...uit.trip,
                userInTrip: uit
            })) || [];
            break;
        case 'form':
            return <FormPage props={props} />;
        case 'announcements':
            return <AnnouncementsReadOnly props={props} />;
        default:
            displayData = [];
    }

    return <PostList props={props} data={displayData} />;
}


export function UserPostBlockInteraction({props, data}) {
    const handleResign = async () => {
        try {
            const response = await fetch(`/user-trip/${data?.id}/resign/${props?.currentUserId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text();
                alert("Failed: " + message);
                return;
            }

            props.setBlockStateUser(!props.blockStateUser)
        } catch (err) {
            alert("Error occurred while resigning.");
        }
    };


    const handleApply = async () => {
        try {
            const response = await fetch(`/user-trip/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    userId: props.currentUserId,
                    tripId: data.id,
                }),

            });


            if (!response.ok) {
                if (response.status === 409) {
                    alert("You are already registered for this trip.");
                } else {
                    alert("Failed to apply to trip.");
                }
            } else {
                alert("Successfully applied!");
                props.setBlockStateUser(!props.blockStateUser)
            }
        } catch (error) {
            alert("Something went wrong.");
        }
    };

    const openAnnouncementsAndInfoAboutOrganiser = () => {
        props.setView('announcements')
        props.setPopup(null)
        props.setPopupData(null)
    }

    return (
        <>
            { (<button className='choice-btn' onClick={() => {
                props.setPopup('expand');
                props.setPopupData(data)
            }}>Expand</button>)}

            {props.view === 'registered' && <button className='choice-btn' onClick={handleResign} id="resing">Resign</button>}
            { props.view === 'registered' && (<button className='choice-btn' id="details" onClick={openAnnouncementsAndInfoAboutOrganiser}>See details</button>)}
            {props.view === 'explore' && <button className='choice-btn' onClick={handleApply} id="apply">Apply</button>}
        </>)
}

export function UserPostExpanded({props}) {
    return (<><div className="scrollableArea">{
        Object.entries(props.popupData).map(([key, value]) => {
            if (Array.isArray(value) || key === 'id') return null;
            
            if (key === 'company' && typeof value === 'object' && value !== null) {
                return (
                    <p key={key}>
                        <strong>{key}:</strong> {value.name || 'Unknown Company'}
                    </p>
                );
            }
            
            if (typeof value === 'object' && value !== null) {
                return (
                    <p key={key}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                    </p>
                );
            }
            
            return (
                <p key={key}>
                    <strong>{key}:</strong> {value?.toString()}
                </p>
            );
        })}
    </div>
    </>)
}