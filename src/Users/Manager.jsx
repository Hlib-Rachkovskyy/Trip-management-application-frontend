import { PostList } from "../Utils";
import {useEffect, useState} from "react";

export function ManagerHeader({props}){
    return (<header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
            </nav>
        </header>
    )
}



export function AnnouncementsWriteOnly({ props }) {
    const [managerData, setManagerData] = useState(null);
    const [newAnnouncement, setNewAnnouncement] = useState({ tripId: '', content: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/manager/2/trips');
                const manager = await response.json();
                setManagerData(manager);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                        {managerData?.trips?.map(trip => (
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
    const [managerData, setManagerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/manager/2/trips');
                const manager = await response.json();
                console.log('Manager data:', manager);
                setManagerData(manager);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.blockStateManager]);

    if (loading) return <div>Loading...</div>;

    console.log('Manager view - props.view:', props.view);
    console.log('Manager view - managerData:', managerData);

    switch (props.view) {
        case 'explore':
            return <PostList props={props} data={managerData?.trips || []} />;
        case 'add-announcement':
            return <AnnouncementsWriteOnly props={props} />;
        default:
            return <PostList props={props} data={managerData?.trips || []} />;
    }
}


export function ManagerPostBlockInteraction({props, data}) {
    console.log(data)
    return(<>
        <button className='choice-btn' onClick={() => (props.setView('add-announcement'))}>Write an announcement
        </button>
        <button className='choice-btn' onClick={() => {
            props.setPopupData(data)
            props.setPopup('users')
        }}>See users in trip
        </button>
        <button className='choice-btn' onClick={() => {
            props.setPopupData(data)
            props.setPopup('tourist-services')
        }}>View touristic services in trip
        </button>
    </>)
}

export function ManagerPopupExpanded({props}) {
    const handleServiceStatusChange = async (serviceId, newStatus) => {
        try {
            const response = await fetch(`/tourist-service/${serviceId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert('Service status updated successfully!');
                // Refresh the data
                window.location.reload();
            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            console.error('Error updating service status:', error);
            alert('Failed to update service status');
        }
    };

    return (
        <div className="manager-popup-content">
            {props.popup === 'users' && (
                <div className="users-section">
                    <h3>Trip Participants</h3>
                    {props.popupData.users?.map((element, index) => (
                        <div key={index} className="user-item">
                            <p><strong>User ID:</strong> {element.id}</p>
                            <p><strong>Name:</strong> {element.user?.name} {element.user?.surname}</p>
                            <p><strong>Email:</strong> {element.user?.email}</p>
                            <p><strong>Phone:</strong> {element.user?.phoneNumber}</p>
                        </div>
                    ))}
                </div>
            )}

            {props.popup === 'tourist-services' && (
                <div className="services-section">
                    <h3>Tourist Services</h3>
                    
                    <div className="hotels-section">
                        <h4>Hotels</h4>
                        {props.popupData.hotelsInTrip?.map((element, index) => (
                            <div key={index} className="service-item">
                                <p><strong>Hotel:</strong> {element.hotel?.name}</p>
                                <p><strong>Address:</strong> {element.hotel?.hotelAddress}</p>
                                <p><strong>Status:</strong> {element.status}</p>
                                <div className="service-actions">
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.id, 'W trakcie')}
                                        disabled={element.status === 'W trakcie'}
                                    >
                                        Start Service
                                    </button>
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.id, 'Zakończony')}
                                        disabled={element.status === 'Zakończony'}
                                    >
                                        End Service
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="vehicles-section">
                        <h4>Vehicles</h4>
                        {props.popupData.vehiclesInTrip?.map((element, index) => (
                            <div key={index} className="service-item">
                                <p><strong>Vehicle:</strong> {element.vehicle?.name}</p>
                                <p><strong>Type:</strong> {element.vehicle?.vehicleType}</p>
                                <p><strong>Status:</strong> {element.status}</p>
                                <div className="service-actions">
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.id, 'W trakcie')}
                                        disabled={element.status === 'W trakcie'}
                                    >
                                        Start Service
                                    </button>
                                    <button 
                                        className="choice-btn" 
                                        onClick={() => handleServiceStatusChange(element.id, 'Zakończony')}
                                        disabled={element.status === 'Zakończony'}
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


