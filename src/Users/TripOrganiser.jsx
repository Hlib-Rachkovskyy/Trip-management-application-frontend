import {useEffect, useState} from "react";
import {PostList, TouristServices, ViewUsers} from "../Utils";

export function OrganiserHeader({props}) {

    return (<header className="Header">
        <nav>
            <button className="choice-btn" onClick={() => {
                props.setPopup('create-trip');
                }
            }>Create trip</button>
            <button className="choice-btn" onClick={() => {
                props.setView('trips-created');
                }
            }>Trips</button>
            <button className="choice-btn" onClick={() => {
                props.setView('form');
                }
            }>View written forms</button>
            {props.view === 'tourist-services' &&
                (<h1 className='black'>You currently viewing tourist service for trip: {props.touristServices.name}</h1>)}
        </nav>
    </header>)

}

export function OrganiserView({props}){
    const [organiserData, setOrganiserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get organiser with their trips using associations
                const response = await fetch('/organiser/1/trips');
                const organiser = await response.json();
                console.log('Organiser data:', organiser);
                setOrganiserData(organiser);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.blockStateOrganiser]);

    if (loading) return <div>Loading...</div>;

    console.log('Organiser view - props.view:', props.view);
    console.log('Organiser view - organiserData:', organiserData);

    switch (props.view) {
        case 'trips-created':
            return <PostList props={props} data={organiserData?.trips || []} />;
        case 'form':
            return <ViewWrittenForms props={props} />;
        case 'tourist-services':
            return <TouristServices props={props} />;
        default:
            return <PostList props={props} data={organiserData?.trips || []} />;
    }
}

export function ViewWrittenForms({props}) {
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get organiser's company with contact forms using associations
                const response = await fetch('/organiser/1/contact-forms');
                const company = await response.json();
                console.log('Contact forms data:', company);
                setCompanyData(company);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [props.blockStateOrganiser]);

    if (loading) return <div>Loading...</div>;

    console.log('ViewWrittenForms - companyData:', companyData);

    return (
        <div className="contact-forms">
            <h3>Contact Forms</h3>
            {companyData?.contactForms?.map(form => (
                <div key={form.id} className="contact-form-card">
                    <div className="form-header">
                        <p><strong>From:</strong> {form.user?.name} {form.user?.surname}</p>
                        <p><strong>Date:</strong> {form.sendDate}</p>
                    </div>
                    <div className="form-content">
                        <p>{form.text}</p>
                    </div>
                </div>
            )) || <p>No contact forms yet</p>}
        </div>
    );
}

export function OrganiserPopupExpanded({props}){
    const [data, setData] = useState()

    const getOrganiserData = async () => {
        try {
            let organiser_data = await fetch('/organiser/test');
            let jsonData = await organiser_data.json()
            setData(jsonData)
        } catch (err) {
            alert("API error while trying to get Organiser information", err)
        }
    };
    useEffect(() => {
 /*       fetch("http://localhost:8080/organiser/1")
            .then((response) => {
                return response.json();
            }).then((data) => {
            setData(data)
        }).catch((err) => console.error('API Error:', err));*/
        getOrganiserData();
    }, []);

    switch (props.popup) {
        case 'create-trip':
            return (<CreateTripForm props={props} data={data}/>)
        case 'assign-manager':
            return (<AssignManager props={props} organiserData={data}/>)
        case 'edit-trip':
            const editData = data.trips
            console.log(editData)
            return (<div className="container-text">
                {Object.entries(editData).map(([key, value]) => {
                    return (!Array.isArray(value) && (<div className="">{key}: <input className=""/></div>))
                })}
                <button onClick={() => {
                }}>Submit
                </button>
                <button onClick={() => {
                    props.setPopup('assign-manager')
                }}>Add manager
                </button>

            </div>)
        case 'view-users':
            return <ViewUsers props={props}/>
        case 'manage': // add tour
            return (<ManagementStateComponent props={props}/>)
        default:
            return null;
    }
}

export function OrganiserPostBlockInteraction({props, data}) {
    return (<>
            <button className='choice-btn' onClick={() => {
                props.setPopup('view-users');
                props.setPopupData(data)
            }}>Users</button>
            <button className='choice-btn' onClick={() => (props.setPopup('edit-trip'))}>Edit</button>
            <button className='choice-btn' onClick={() => {
                props.setPopup('manage');
                props.setCurrentTouristService(null); // Reset current tourist service
                props.setView('tourist-services')
            }}>Manage</button>
        </>
    )
}

function AssignManager({props, organiserData}) {
    const [data, setData] = useState(null)
    const [selected, setSelected] = useState('');

    const fetchData = async () => {
        const res = await fetch(`/manager/${organiserData.company?.id}`, {});
        const json = await res.json();
        setData(json);
    };
    useEffect(() => {
        fetchData();
    }, []);
    console.log(data)

    const handleAssign = async () => {
        try {
            const response = await fetch(`/assign/manager`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    managerId: selected.id,
                    tripId: data.id,
                }),
            });


            if (!response.ok) {
                if (response.status === 409) {
                    alert("Manager was assigned.");
                } else {
                    alert("Failed to assign manager.");
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
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">Select an item</option>
                {data.map((item) => (
                    <option key={item} value={item}>
                        {item.name}
                        <> </>
                        {item.surname}
                    </option>
                ))}
            </select>
            <button onClick={handleAssign} disabled={!selected}>
                Assign
            </button>
        </div>
    );
}

function ManagementStateComponent({props}) {
    const [currentTouristService, setCurrentTouristService] = useState(null);

    useEffect(() => {
        // Get the current tourist service from props
        if (props.currentTouristService) {
            setCurrentTouristService(props.currentTouristService);
        }
    }, [props.currentTouristService]);

    const handleStatusChange = async (newStatus) => {
        if (!newStatus || !currentTouristService) return;
        
        try {
            const response = await fetch(`/tourist-service/${currentTouristService.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert('Status updated successfully!');
                // Refresh the data
                if (props.setBlockStateOrganiser) {
                    props.setBlockStateOrganiser(!props.blockStateOrganiser);
                }
                props.setPopup(null);
            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    if (!currentTouristService) {
        return (
            <div className="management-state">
                <h3>Tourist Service Management</h3>
                <p>No tourist service selected.</p>
                <button className="choice-btn" onClick={() => props.setPopup(null)}>Close</button>
            </div>
        );
    }

    const isVehicle = !!currentTouristService.vehicleType;
    const isHotel = !!currentTouristService.hotelAddress;

    return (
        <div className="management-state">
            <h3>Manage Tourist Service</h3>
            
            <div className="service-info">
                <h4>{currentTouristService.name}</h4>
                <p><strong>Type:</strong> {isVehicle ? 'Vehicle' : isHotel ? 'Hotel' : 'Unknown'}</p>
                <p><strong>Current Status:</strong> {currentTouristService.state}</p>
                <p><strong>Phone:</strong> {currentTouristService.phoneNumbers}</p>
                
                {isVehicle && (
                    <>
                        <p><strong>Vehicle Type:</strong> {currentTouristService.vehicleType}</p>
                        {currentTouristService.driverCompany && (
                            <p><strong>Driver Company:</strong> {currentTouristService.driverCompany}</p>
                        )}
                    </>
                )}
                
                {isHotel && (
                    <>
                        <p><strong>Address:</strong> {currentTouristService.hotelAddress}</p>
                        {currentTouristService.hotelWebsite && (
                            <p><strong>Website:</strong> {currentTouristService.hotelWebsite}</p>
                        )}
                        {currentTouristService.hotelEmail && (
                            <p><strong>Email:</strong> {currentTouristService.hotelEmail}</p>
                        )}
                    </>
                )}
            </div>

            <div className="status-management">
                <h4>Update Status</h4>
                <div className="status-buttons">
                    <button 
                        className="choice-btn" 
                        onClick={() => handleStatusChange('Bez Wyjazdu')}
                        disabled={currentTouristService.state === 'Bez Wyjazdu'}
                    >
                        Bez Wyjazdu
                    </button>
                    <button 
                        className="choice-btn" 
                        onClick={() => handleStatusChange('Dodany Do Wyjazdu')}
                        disabled={currentTouristService.state === 'Dodany Do Wyjazdu'}
                    >
                        Dodany Do Wyjazdu
                    </button>
                    <button 
                        className="choice-btn" 
                        onClick={() => handleStatusChange('W trakcie')}
                        disabled={currentTouristService.state === 'W trakcie'}
                    >
                        W trakcie
                    </button>
                </div>
            </div>

            <button className="choice-btn" onClick={() => props.setPopup(null)}>Close</button>
        </div>
    );
}





export function CreateTripForm({props, data}) {

    const [form, setForm] = useState({
        name: '',
        registrationDateEnd: '',
        departurePoint: '',
        arrivalPoint: '',
        startDate: '',
        endDate: '',
        programDescription: '',
        numberOfUsersInGroup: '',
        price: '',
        registrationState: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/organiser/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    registrationDateEnd: form.registrationDateEnd,
                    departurePoint: form.departurePoint,
                    arrivalPoint: form.arrivalPoint,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    programDescription: form.programDescription,
                    numberOfUsersInGroup: Number(form.numberOfUsersInGroup),
                    price: Number(form.price),
                    registrationState: form.registrationState,
                    companyId: Number(data.company?.id),
                    organiserId: data.id,
                })
            });

            if (!response.ok) {
                const msg = await response.text();
                alert('Error: ' + msg);
                return;
            }
            alert('Trip saved successfully');
            props.setPopup('assign-manager');
        } catch (err) {
            console.error(err);
            alert('Submission failed');
        }
    };

    return (
        <div className="container-text">
            {Object.entries(form).map(([key, val]) => (
                <div key={key}>
                    <label>
                        {key}:
                        <input
                            name={key}
                            value={val}
                            onChange={handleChange}
                        />
                    </label>
                </div>
            ))}
            <button className="choice-btn" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}
