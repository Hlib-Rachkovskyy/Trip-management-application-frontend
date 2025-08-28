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
        <div  className="container">
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

    const handleClose = () => {
        props.setPopup(null);
        props.setId(0);

        if (props.popup === 'manage'){
            props.setView('trips-created');
            props.setCurrentTouristService(null)
            props.setCurrentOptionService(null)
        }
    }

    return (
        <div className="popup">
            <div className="popup-content">
                {   props.userType === 'user' && props.popup === 'expand' && (<UserPostExpanded props={props}/>)}
                {   props.userType === 'user' && props.popup === 'manager-details' && (<ManagerDetailsPopup props={props}/>)}
                {   props.userType === 'organiser' && (<OrganiserPopupExpanded props={props}/>)}
                {   props.userType === 'manager' && (<ManagerPopupExpanded props={props}/>)}

                <button className="choice-btn" onClick={handleClose}>Close</button>
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


export function UserData({props}) {
    const handleUserApprovalToTrip = async () => { // To do

    }

    const handleUserRemovalFromTrip = async () => {

    }

    return (<div className="users-section">
        <h3>Trip Participants</h3>
        {props.popupData.map((element, index) => (
            <div key={index} className="user-item">
                <p><strong>User ID:</strong> {element.id}</p>
                <p><strong>Name:</strong> {element.user?.name} {element.user?.surname}</p>
                <p><strong>Email:</strong> {element.user?.email}</p>
                <p><strong>Phone:</strong> {element.user?.phoneNumber}</p>
                <p><strong>Role:</strong> {element.role}</p>
                {props.userType === 'organiser' && element.role === 'Registered' && <button className="choice-btn">Approve</button>}
                {props.userType === 'organiser' && element.role === 'IsPartOfTrip' && <button className="choice-btn">Remove</button>}

            </div>
        ))}
    </div>)
}
