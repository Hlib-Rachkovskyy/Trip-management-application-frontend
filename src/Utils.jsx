import {useEffect, useState} from "react";
import {OrganiserPostBlockInteraction, OrganiserPopupExpanded} from "./Users/TripOrganiser";
import {UserPostBlockInteraction, UserPostExpanded} from "./Users/User";import {ManagerPopupExpanded, ManagerPostBlockInteraction} from "./Users/Manager";



export function PostList({props, data}){
    let tripsToDisplay = [];
    
    if (Array.isArray(data)) {
        tripsToDisplay = data;
    } else if (data?.trips) {
        tripsToDisplay = data.trips;
    } else if (data?.userInTripList) {
        tripsToDisplay = data.userInTripList.map(uit => ({
            ...uit.trip,
            userInTrip: uit
        }));
    } else {
        tripsToDisplay = [];
    }

    return (
        <div className="container-list">
            {tripsToDisplay.map((value) =>
                (<PostBlock key={value.id} props={props} data={value}/>)
            )}
        </div>
    )
}

export function PostBlock({props, data}) {
    return (
        <div className="container">
            <div className="container-content">
                <h5>Name: {data?.name}</h5>
                <p>Start date: {data?.startDate}</p>
                <p>End date: {data?.endDate}</p>
                <p>Price: ${data?.price}</p>
                {data?.company && <p>Company: {data.company.name}</p>}
            </div>
            <div className="container-buttons">
                {props.userType === 'user' && <UserPostBlockInteraction props={props} data={data}/>}
                {props.userType === 'organiser' && <OrganiserPostBlockInteraction props={props} data={data}/>}
                {props.userType === 'manager' && <ManagerPostBlockInteraction props={props} data={data}/>}
            </div>
        </div>)
}




export function Popup({props}) {
    return (
        <div className="popup">
            <div className="popup-content">
                {   props.userType === 'user' && props.popup === 'expand' && (<UserPostExpanded props={props}/>)}
                {   props.userType === 'user' && props.popup === 'manager-details' && (<ManagerDetailsPopup props={props}/>)}
                {   props.userType === 'organiser' && (<OrganiserPopupExpanded props={props}/>)}
                {   props.userType === 'manager' && (<ManagerPopupExpanded props={props}/>)}

                <button className="choice-btn" onClick={() => {props.setPopup(null)}}>Close</button>
            </div>
        </div>
    );
}

export function ManagerDetailsPopup({props}) {
    const manager = props.popupData;
    
    return (
        <div className="manager-details">
            <h3>Trip Manager Details</h3>
            <div className="manager-info">
                <p><strong>Name:</strong> {manager.name} {manager.surname}</p>
                <p><strong>Phone:</strong> {manager.phoneNumber}</p>
                <p><strong>Email:</strong> {manager.email}</p>
                <p><strong>Company:</strong> {manager.company?.name}</p>
                <p><strong>Position:</strong> Trip Manager</p>
            </div>
        </div>
    );
}

export function ViewUsers({props}) {
    console.log('ViewUsers - props.popupData:', props.popupData);
    console.log('ViewUsers - users:', props.popupData?.users);
    
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
            const response = await fetch(`/user-trip/${props.popupData.id}/resign/${selected.user.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text();
                alert("Failed: " + message);
                return;
            }

            alert("Successfully removed user from trip.");
            // Refresh the data by triggering a re-render
            if (props.setBlockStateOrganiser) {
                props.setBlockStateOrganiser(!props.blockStateOrganiser);
            }
            props.setPopup(null);
        } catch (err) {
            alert("Error occurred while removing user.");
        }
    };

    const handleAssignToTrip = async () => {
        try {
            const response = await fetch(`/user-trip/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selected.user.id,
                    tripId: props.popupData.id
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    alert("User is already assigned to this trip.");
                } else {
                    alert("Failed to assign user to trip.");
                }
                return;
            }

            alert("Successfully assigned user to trip!");
            // Refresh the data by triggering a re-render
            if (props.setBlockStateOrganiser) {
                props.setBlockStateOrganiser(!props.blockStateOrganiser);
            }
            props.setPopup(null);
        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (
        <div>
            <select value={selectedId} onChange={handleAssign}>
                <option value="">Select a user</option>
                {props.popupData.users?.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.user.name} {item.user.surname} - {item.role}
                    </option>
                ))}
            </select>
            {
                selected && typeof selected === 'object' && (
                    <div className="scrollableArea">
                        <h4>User Details:</h4>
                        <p><strong>Name:</strong> {selected.user.name} {selected.user.surname}</p>
                        <p><strong>Email:</strong> {selected.user.email}</p>
                        <p><strong>Phone:</strong> {selected.user.phoneNumber}</p>
                        <p><strong>Role:</strong> {selected.role}</p>
                        <p><strong>Registration Date:</strong> {selected.registerDate}</p>
                        <p><strong>Registration Order:</strong> {selected.registrationOrder}</p>
                    </div>
                )}
            { selected?.role === 'isPartOfTrip' && (
                <button className="choice-btn" onClick={handleResign}>Remove from Trip</button>
            )}
            { selected?.role === 'Registered' && (
                <button className="choice-btn" onClick={handleAssignToTrip}>Assign to Trip</button>
            )}
        </div>
    );
}


export function TouristServices({ props }){

    return (<TouristServicesList props={props}/>

    )
}

export function TouristServicesList({ props }) {
    console.log('TouristServicesList - props.touristServices:', props.touristServices);
    console.log('TouristServicesList - vehiclesInTrip:', props.touristServices?.vehiclesInTrip);
    console.log('TouristServicesList - hotelsInTrip:', props.touristServices?.hotelsInTrip);
    
    return (
        <div className="container-list">
            {props.touristServices?.vehiclesInTrip?.map((vehicle, index) =>
                (<TouristServiceBlock key={index} props={props} data={vehicle}/>)) }
            {props.touristServices?.hotelsInTrip?.map((hotel, index) =>
                (<TouristServiceBlock key={index} props={props} data={hotel}/>)) }
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

    const status = data.status || "Unknown";
    const statusColor = status === "W trakcie" ? "green" : 
                       status === "Dodany Do Wyjazdu" ? "blue" : 
                       status === "Bez Wyjazdu" ? "gray" : "black";

    const handleClick = () => {
        if (isVehicle) {
            props.setCurrentTouristService(data.vehicle);
        } else if (isHotel) {
            props.setCurrentTouristService(data.hotel);
        }
        props.setPopup('manage');
    };

    return (
        <div className="container tourist-service-block" onClick={handleClick}>
            <div className="container-content">
                <h5>Name: {name}</h5>
                <p>Start date: {startDate}</p>
                <p style={{color: statusColor}}>Status: {status}</p>
                <div className="service-details">
                    {isVehicle && (
                        <>
                            <p>Type: {data.vehicle.vehicleType}</p>
                            {data.vehicle.driverCompany && <p>Company: {data.vehicle.driverCompany}</p>}
                        </>
                    )}
                    {isHotel && (
                        <>
                            <p>Address: {data.hotel.hotelAddress}</p>
                            {data.hotel.hotelWebsite && <p>Website: {data.hotel.hotelWebsite}</p>}
                            {data.hotel.hotelEmail && <p>Email: {data.hotel.hotelEmail}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}