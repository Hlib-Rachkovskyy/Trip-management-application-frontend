import {useEffect, useState} from "react";
import {PopupManagement} from "./Users/TripOrganiser";

export function FetchData(string){
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


export function PostList({props, data}){
    console.log(data)
    return (
        <div className="container-list">
            {Array.isArray(data) && data?.map((value) =>
                (<PostBlock props={props} data={value}/>)
            )}
        </div>
    )
}

export function PostBlock({props, data}) {

    const handleResign = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/${data?.id}/resign/${props?.currentUserId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text();
            //    alert("Failed: " + message);
                return;
            }

          //  alert("Successfully resigned from the trip.");
            props.setBlockStateUser(!props.blockStateUser)

        } catch (err) {
         //   alert("Error occurred while resigning.");
        }
    };


    const handleApply = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/apply`, {
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
                return;
            }

            alert("Successfully applied!");
            props.setBlockStateUser(!props.blockStateUser)

        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (<div className="container">
        <h5>Name: {data?.name}</h5>
        <p>Start date: {data?.startDate}</p>
        {props.userType === 'user' && (<button className='choice-btn' onClick={() => {
            props.setPopup('expand');
            props.setPopupData(data)
        }}>Expand</button>)}

        {props.view === 'registered' && props.userType === 'user' && <button className='choice-btn' onClick={handleResign} id="resing">Resign</button>}
        {props.view === 'explore' && props.userType === 'user' && <button className='choice-btn' onClick={handleApply} id="apply">Apply</button>}
        {props.userType === 'organiser' && <button className='choice-btn' onClick={() => {props.setPopup('view-users'); props.setPopupData(data)}}>Users</button>}
        {props.userType === 'organiser' && <button className='choice-btn' onClick={() => (props.setPopup('edit-trip'))}>Edit</button>}
        {props.userType === 'organiser' && <button className='choice-btn'
                                                   onClick={() => { props.setPopup('manage'); props.setTouristServices(data); props.setView('tourist-services')}}>Manage</button>}


        {props.userType === 'manager' && <button className='choice-btn' onClick={() => (props.setView('add-announcement'))}>Write an announcement</button>}

    </div>)
}

export function UserPostExpanded({props}) {
    console.log(props.popupData)

    return (<div className="scrollableArea">{
        Object.entries(props.popupData).map(([key, value]) => (!Array.isArray(value) && key!== 'id' && (
            <p>
                <strong>{key}:</strong> {value?.toString()}
            </p>)))}
    </div>)
}

export function Popup({props}) {
    let hasRegisteredUser= null
    if (props.userType === 'user'){
        hasRegisteredUser = props.popupData.users.some(
            (userInTrip) =>
                userInTrip.user.id === props.currentUserId && userInTrip.role === 'IsPartOfTrip'
        );}


    return (
        <div className="popup">
            <div className="popup-content">
                {   props.userType === 'user' && (<UserPostExpanded props={props}/>)}
                {   props.userType === 'organiser' && (<PopupManagement props={props}/>)}

                {
                    props.view === 'registered' &&
                    hasRegisteredUser &&
                    (<button className='choice-btn' id="apply" onClick={() => {
                        props.setView('announcements');
                        props.setPopup(null);
                    }}>See announcements</button>)}

                {   props.popup !== 'manage' &&
                    (<button className="choice-btn" onClick={() => {
                        props.setPopup(null);
                    }}>Close</button>)}
            </div>
        </div>
    );
}




export function ViewUsers({props}) {
    const [selectedId, setSelectedId] = useState('');
    const [selected, setSelected] = useState(null);
    const handleAssign = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        const selectedItem = props.popupData.users?.find(item => item.id.toString() === id);
        setSelected(selectedItem);
    };

    const handleResign = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/${props.popupData.id}/resign/${selected.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text();
                alert("Failed: " + message);
                return;
            }

            alert("Successfully resigned from the trip.");
        } catch (err) {
            alert("Error occurred while resigning.");
        }
    };


    const handleAssignToTrip = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selected.id,
                    tripId: props.popupData.id,
                    role: 'IsPartOfTrip'
                }),
            });


            if (!response.ok) {
                if (response.status === 409) {
                    alert("You are already registered for this trip.");
                } else {
                    alert("Failed to apply to trip.");
                }
                return;
            }

            alert("Successfully applied!");

        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (
        <div>
            <select value={selectedId} onChange={handleAssign}>
                <option value="">Select an item</option>
                {props.popupData.users?.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.user.name}
                        <> </>
                        {item.user.surname}
                    </option>
                ))}
            </select>
            {
                selected && typeof selected === 'object' && (
                    <div className="scrollableArea">
                        {Object.entries(selected).map(([key, value]) =>
                            (key !== "id" && key !=="user" && (<p key={key}>
                                {(<strong>{key}:</strong>)} {value?.toString()}
                            </p>))) }

                        {Object.entries(selected.user).map(([key, value]) => (
                            (key !== "id" && (<p key={key}>
                                <strong>{key}:</strong> {value?.toString()}
                            </p>))
                        ))}
                    </div>
                )}
            { selected?.role === 'isPartOfTrip' && (<button className="choice-btn" onClick={handleResign}>Delete</button>)}
            { selected?.role === 'Registered' && (<button className="choice-btn" onClick={handleAssignToTrip}>Assign to trip</button>)}

        </div>
    );
}


export function TouristServices({ props }){

    return (<TouristServicesList props={props}/>

    )
}

export function TouristServicesList({ props }) {
    return (
        <div className="container-list">
            {props.touristServices.vehiclesInTrip?.map((vehicle, index) =>
                (<TouristServiceBlock props={props} data={vehicle}/>)) }
            {props.touristServices.hotelsInTrip?.map((hotel, index) =>
                (<TouristServiceBlock props={props} data={hotel}/>)) }
        </div>
    )
}

function TouristServiceBlock({ props, data }){
    const isVehicle = !!data.vehicle;
    const isHotel = !!data.hotel;
    const name = isVehicle
        ? data.vehicle.name
        : isHotel
            ? data.hotel.name
            : "Unknown";

    const startDate = isVehicle
        ? data.vehicleStartDate || data.startDate
        : isHotel
            ? data.hotelStartDate || data.startDate
            : "Unknown";




    return (<div className="container" onClick={() =>
    {isVehicle && props.setCurrentTouristService(data.vehicle);
        isHotel && props.setCurrentTouristService(data.hotel);
        props.setPopup('manage'); }}>
        <h5>Name: {name}</h5>
        <p>Start date: {startDate}</p>
    </div>)
}