import {PostList, UserData} from "../Utils";
import {useEffect, useState} from "react";

export function ManagerHeader({props}){
    return (<header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
                <button className='choice-btn' onClick={() => (props.setView('add-announcement'))}>Write an announcement
                </button>
            </nav>
        </header>
    )
}


export function AnnouncementsWriteOnly({props}) {
    const [newAnnouncement, setNewAnnouncement] = useState({ tripId: '', content: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false)
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('/announcement/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAnnouncement)
            });
            setNewAnnouncement({ tripId: '', content: '' });
            alert('Announcement created successfully!');
        } catch (error) {
            console.error('Error creating announcement:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="announcements-write">
            <h3>Create Announcement</h3>
            
            <form onSubmit={handleSubmit} className="announcement-form">
                <div className="form-group">
                    <label htmlFor="tripSelect">Select Trip:</label>
                    <select
                        id="tripSelect"
                        value={newAnnouncement.tripId}
                        onChange={(e) => setNewAnnouncement({
                            ...newAnnouncement,
                            tripId: e.target.value
                        })}
                        required
                    >
                        <option value="">Choose a trip...</option>
                        {props.userData?.trips?.map(trip => (
                            <option key={trip.id} value={trip.id}>
                                {trip.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="content">Announcement Content:</label>
                    <textarea
                        id="content"
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({
                            ...newAnnouncement,
                            content: e.target.value
                        })}
                        required
                        rows="4"
                        placeholder="Enter announcement content..."
                    />
                </div>
                
                <button type="submit" className="btn btn-primary">
                    Create Announcement
                </button>
            </form>
        </div>
    );
}

export function ManagerView({props}){
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/manager/${props.currentUserId}`);
                const manager = await response.json();
                props.setUserData(manager);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.blockStateManager]);

    if (loading) return <div>Loading...</div>;
    switch (props.view) {
        case 'add-announcement':
            return <AnnouncementsWriteOnly props={props} />;
        case 'explore':
        default:
            return <PostList props={props} data={props.userData.trips} />;
    }
}


export function ManagerPostBlockInteraction({props, data}) {
    return(<>
        <button className='choice-btn' onClick={() => {
            props.setPopup('users')
            props.setPopupData(data.users)
        }}>See users in trip
        </button>
        <button className='choice-btn' onClick={() => {
            props.setPopup('tourist-services')
            props.setPopupData(data)
        }}>View touristic services in trip
        </button>
    </>)
}


export function ManagerPopupExpanded({props}) {
    const [loading, setLoading] = useState(true);
    const [serviceLogic, setServiceLogic] = useState(true);

    useEffect(() => {
        setLoading(false)
    }, [serviceLogic]);




    const handleServiceStatusChange = async (serviceId, newStatus) => {
        try {
            const response = await fetch(`/tourist-service/${serviceId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus: newStatus })
            });

            if (response.ok) {
                alert('Service status updated successfully!');
                setServiceLogic(!serviceLogic)
            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            console.error('Error updating service status:', error);
            alert('Failed to update service status');
        }
    };

    if (loading) return <div>Loading...</div>;
    return (
        <div className="employee-popup-content">
            {props.popup === 'users' && (
                <UserData props={props}/>
            )}
            {props.popup === 'tourist-services' && (
                <div className="services-section">
                    <h3>Tourist Services</h3>
                    {(props.popupData.vehiclesInTrip.length === 0) && (props.popupData.vehiclesInTrip.length === 0) && (<h2>There's no tourist services available</h2>)}
                    <div className="hotels-section">
                        {(props.popupData.vehiclesInTrip.length > 0) && (<h4>Hotels</h4>)}

                        {(props.popupData.hotelsInTrip.length > 0) && props.popupData.hotelsInTrip?.map((element, index) => (
                            <div key={index} className="service-item">
                                <p><strong>Hotel:</strong> {element.hotel?.name}</p>
                                <p><strong>Address:</strong> {element.hotel?.hotelAddress}</p>
                                <p><strong>Status:</strong> {element.hotel?.state}</p>
                                <div className="service-actions">
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.hotel?.id, 'Active')}
                                        disabled={element.hotel?.state === 'Active' || element.hotel?.state === 'Completed'}
                                    >
                                        Start Service
                                    </button>
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.hotel?.id, 'Completed')}
                                        disabled={element.hotel?.state === 'Completed'}
                                    >
                                        End Service
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="vehicles-section">
                        {(props.popupData.vehiclesInTrip.length > 0) && (<h4>Vehicles</h4>)}
                        {props.popupData.vehiclesInTrip?.map((element, index) => (
                            <div key={index} className="service-item">
                                <p><strong>Vehicle:</strong> {element.vehicle?.name}</p>
                                <p><strong>Type:</strong> {element.vehicle?.vehicleType}</p>
                                <p><strong>Status:</strong> {element.vehicle?.state}</p>
                                <div className="service-actions">
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.vehicle.id, 'Active')}
                                        disabled={element.vehicle?.state === 'Active' || element.vehicle?.state === 'Completed'}
                                    >
                                        Start Service
                                    </button>
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.vehicle.id, 'Completed')}
                                        disabled={element.vehicle?.state === 'Completed'}
                                    >
                                        End Service
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


