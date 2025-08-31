import {use, useEffect, useState} from "react";
import {PostList, UserData} from "../Utils";

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
                (<h1 className='black'>You currently viewing tourist service for trip: {props.popupData.name}</h1>)}
        </nav>
    </header>)

}



export function OrganiserView({props}){
    const [loading, setLoading] = useState(true);

    const refetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/organiser/${props.currentUserId}`);
            const organiser = await response.json();
            props.setUserData(organiser);
            return organiser;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (props.setRefetchFunction) {
            props.setRefetchFunction(() => refetchData);
        }
    }, [props.currentUserId]);

    useEffect(() => {
        refetchData();
    }, [props.updateData]);

    if (loading) return <div>Loading...</div>;


    switch (props.view) {

        case 'form':
            return <ViewWrittenForms props={props} />;
        case 'tourist-services':
            return <TouristServices props={props} />;
        case 'trips-created':
        default:
            return <PostList props={props} data={props.userData?.trips} />;
    }
}


export function OrganiserPostBlockInteraction({props, data}) {
    return (<>
            <button className='choice-btn' onClick={() => {
                props.setPopup('view-users');
                props.setPopupData(data.users)
            }}>Users</button>
            <button className='choice-btn' onClick={() => {
                props.setPopup('edit-trip');
                props.setPopupData(data)
            }}>Edit</button>
            <button className='choice-btn' onClick={() => {
                props.setPopup('manage');
                props.setPopupData(data)
                props.setView('tourist-services')
            }}>Manage</button>
        </>
    )
}

export function ViewWrittenForms({props}) {
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/organiser/company/${props.userData.company.id}`);
                const company = await response.json();
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

    const userForms = companyData?.contactForms?.reduce((acc, form) => {
        const userId = form.user?.id;
        if (!acc[userId]) {
            acc[userId] = {
                user: form.user,
                forms: []
            };
        }
        acc[userId].forms.push(form);
        return acc;
    }, {}) || {};

    const users = Object.values(userForms);

    const handleUserSelect = (e) => {
        setSelectedUserId(e.target.value);
    };

    const selectedUser = selectedUserId ? userForms[selectedUserId] : null;

    return (
        <div className="contact-forms">
            <h3>Contact Forms</h3>
            {users.length > 0 ? (
                <div>
                    <div className="user-selector" >
                        <label htmlFor="user-select" >
                            Select a user to view their contact forms:
                        </label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={handleUserSelect}>
                            <option value="">-- Choose a user --</option>
                            {users.map(({user, forms}) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname} ({user.email}) - {forms.length} forms
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedUser && (
                        <div className="user-forms">
                            <div>
                                <h4>Contact forms from {selectedUser.user.name} {selectedUser.user.surname}</h4>
                                <p><strong>Email:</strong> {selectedUser.user.email}</p>
                                <p><strong>Total forms:</strong> {selectedUser.forms.length}</p>
                            </div>

                            {selectedUser.forms.map(form => (
                                <div
                                    key={form.id}
                                    className="contact-form-card">
                                    <div className="form-header" style={{ marginBottom: '10px' }}>
                                        <p><strong>From:</strong> {form.user?.name} {form.user?.surname}</p>
                                        <p><strong>Date:</strong> {form.sendDate}</p>
                                    </div>
                                    <div className="form-content">
                                        <p >{form.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p>No contact forms yet</p>
            )}
        </div>
    );
}

export function OrganiserPopupExpanded({props}){
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false)
    }, []);

    if (loading) return <div>Loading...</div>
    switch (props.popup) {
        case 'create-trip':
            return (<CreateTripForm props={props}/>)
        case 'assign-manager':
            return (<AssignManager props={props}/>)
        case 'edit-trip':
            return (<TripEdition props={props} />)
        case 'view-users':
            return (<UserData props={props}/>)
        case 'manage':
            return (<ManagementStateComponent props={props}/>)
        default:
            return null;
    }
}


export function TripEdition({ props }) {
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData.entries());

        const requestBody = {
            name: formObject.name,
            registrationDateEnd: formObject.registrationDateEnd,
            departurePoint: formObject.departurePoint,
            arrivalPoint: formObject.arrivalPoint,
            startDate: formObject.startDate,
            endDate: formObject.endDate,
            companyId: parseInt(formObject.companyId),
            programDescription: formObject.programDescription,
            organiserId: parseInt(formObject.organiserId),
            numberOfUsersInGroup: parseInt(formObject.numberOfUsersInGroup),
            price: parseFloat(formObject.price),
            registrationState: formObject.registrationState
        };

        try {
            const response = await fetch(`/organiser/trip/${props.popupData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const tripId = await response.json();
                props.setPopup(null);
                const updatedData = await props.refetchFunction();
                props.setUserData(updatedData)
            } else {
                const errorText = await response.text();
                console.error('Error submitting form:', errorText);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <>
            <form className="scrollableArea" onSubmit={handleSubmit}>
                {Object.entries(props.popupData).map(([key, value]) => {
                    if (Array.isArray(value) || key === 'id') return null;

                    if (key === 'company' && typeof value === 'object' && value !== null) {
                        return (
                            <div key={key} className="form-field">
                                <label htmlFor={key}><strong>{key}:</strong></label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    defaultValue={value.name || 'Unknown Company'}
                                />
                            </div>
                        );
                    }

                    if (typeof value === 'object' && value !== null) {
                        return (
                            <div key={key} className="form-field">
                                <label htmlFor={key}><strong>{key}:</strong></label>
                                <textarea
                                    id={key}
                                    name={key}
                                    defaultValue={JSON.stringify(value)}
                                    rows="3"
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={key} className="form-field">
                            <label htmlFor={key}><strong>{key}:</strong></label>
                            <input
                                type="text"
                                id={key}
                                name={key}
                                defaultValue={value?.toString()}
                            />
                        </div>
                    );
                })}
                <button type="submit" className="choice-btn">
                    Submit
                </button>
            </form>
            <button
                className="choice-btn"
                onClick={() => {props.setPopup('assign-manager');}}

            >
                Assign manager
            </button>
        </>
    );
}

function AssignManager({props}) {
    const [selectedManagerId, setSelectedManagerId] = useState(0)
    const [managerList, setManagerList] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const response = await fetch(`/organiser/company/${props.userData.company.id}`);
            const company = await response.json();
            return company.employee
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchAndFilter = async () => {
        const data = await fetchData();
        const filteredManagers = data.filter(
            manager => !props.popupData.tripManager?.some(pm => pm.id === manager.id)
        );
        const cleanArray = filteredManagers.filter(obj => Object.keys(obj).length > 0);
        setManagerList(cleanArray);
    };


    useEffect(() => {
        fetchAndFilter()
    }, [props.updateData]);

    const handleAssign = async () => {
        try {
            const response = await fetch(`/assign/manager`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    managerId: selectedManagerId,
                    tripId: props.popupData.id,
                }),
            });


            if (!response.ok) {
                alert(response.text());
                return;
            }
            alert("You have successfully assigned an manager!");

        } catch (error) {
            alert("Something went wrong.");
        } finally {
            props.setPopup(null)
            await props.refetchFunction()
        }
    };

    if (loading) return <div>Loading...</div>
    return (
        <div>
            <select value={selectedManagerId} onChange={(e) => setSelectedManagerId(e.target.value)}>
                <option  value={0} disabled>Select an item</option>
                {
                    managerList.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                        <> </>
                        {item.surname}
                    </option>
                ))}
            </select>
            <button onClick={handleAssign} disabled={selectedManagerId === 0}>
                Assign
            </button>
        </div>
    );
}




export function CreateTripForm({props}) {
    const [form, setForm] = useState({
        name: "",
        registrationDateEnd: "",
        departurePoint: "",
        arrivalPoint: "",
        startDate: "",
        endDate: "",
        programDescription: "",
        numberOfUsersInGroup: "",
        price: "",
        registrationState: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/organiser/trip', {
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
                    companyId: Number(props.userData.company?.id),
                    organiserId: props.userData.id,
                })
            });


            props.setUpdateData(!props.updateData);

            if (!response.ok) {
                const msg = await response.text();
                alert(msg)
                return;
            }
            const id = await response.json()

            alert('Trip saved successfully');
            if (props.refetchFunction) {
                const updatedData = await props.refetchFunction();
                const trip = updatedData.trips?.find(t => t.id === id);

                if (trip) {
                    props.setPopupData(trip);
                    props.setPopup('assign-manager');
                } else {
                    console.error('Trip not found after refetch');
                }
            } else {
                props.setPopupData(id);
                props.setUpdateData(!props.updateData);
                props.setPopup('assign-manager');
            }


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


export function TouristServices({ props }) {


    const hotels = (props.popupData.hotelsInTrip || []).map(hotelEntry => (
        <TouristServiceBlock
            key={`hotel-${hotelEntry.id}`}
            props={props}
            data={hotelEntry}
        />
    ));

    const vehicles = (props.popupData.vehiclesInTrip || []).map(vehicleEntry => (
        <TouristServiceBlock
            key={`vehicle-${vehicleEntry.id}`}
            props={props}
            data={vehicleEntry}
        />
    ));

    const elements = [...hotels, ...vehicles];

    if (props.currentOptionService === 'add' && !props.currentTouristService) {
        elements.push(
            <EmptyServiceBlock
                key="empty-service"
                props={props}
            />
        );
    }

    return <div className="container-list">{elements}</div>;
}

function EmptyServiceBlock({ props }) {
    const handleClick = () => {
        props.setAddOption('new');
        props.setCurrentTouristService(null)
        props.setPopup('manage');

    };

    return (
        <div
            className="container tourist-service-block empty-service-block"
            onClick={handleClick}
        >
            <div className="container-content">
                <h5 >+ Add New Tourist Service</h5>
                <p >Click to choose service type</p>
            </div>
        </div>
    );
}


function TouristServiceBlock({ props, data }){
    const isVehicle = !!data.vehicle;
    const isHotel = !!data.hotel;

    const currentService = isVehicle ? data.vehicle : isHotel ? data.hotel : null;
    const isSelected = props.currentTouristService &&
        currentService &&
        props.currentTouristService.id === currentService.id;

    const getBackgroundColor = () => {
        if (!isSelected) {
            return '';
        }

        switch (props.currentOptionService) {
            case 'add':
            case 'edit':
                return '#90EE90';
            case 'delete':
                return '#FFB6C1';
            default:
                return '#E6E6FA';
        }
    };

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


    const handleClick = () => {
        props.setAddOption('copy')
        if (isVehicle) {
            const vehicleDataWithList = {
                ...data.vehicle,
                vehicleInTripList: data
            };
            props.setCurrentTouristService(vehicleDataWithList);

        } else if (isHotel) {
            const hotelDataWithExtra = {
                ...data.hotel,
                hotelInTripList: data
            };
            props.setCurrentTouristService(hotelDataWithExtra);
        }
        props.setPopup('manage');
    };


    return (
        <div
            style={{ backgroundColor: getBackgroundColor() }}
            className="container tourist-service-block"
            onClick={handleClick}
        >
            <div className="container-content">
                <h5>Name: {name}</h5>
                <p>Start date: {startDate}</p>
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
                {isSelected && props.currentOptionService && (
                    <div className="operation-indicator">
                        <small style={{
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            color: props.currentOptionService === 'delete' ? '#8B0000' : '#006400'
                        }}>
                            {props.currentOptionService === 'add' ? 'Adding' :
                                props.currentOptionService === 'edit' ? 'Editing' :
                                    props.currentOptionService === 'delete' ? 'Deleting' : ''}
                        </small>
                    </div>
                )}
            </div>
        </div>
    )
}

function ManagementStateComponent({props}) {
    const resetManagementState = () => {
        props.setCurrentOptionService(null);
        props.setCurrentTouristService(null);
        props.setPopup(null);
        props.setView('created-trips')
        props.setAddOption(null)

    };

    const enhancedProps = {
        ...props,
        resetManagementState,
        refreshTripData: props.refreshTripData
    };

    const handleAdditionOfNewTouristService = () => {
        props.setCurrentOptionService('add');
        props.setPopup(null)
    }

    const handleEditionOfTouristService = () => {
        props.setCurrentOptionService('edit');
        props.setPopup(null)
    }

    const handleDeletionOfTouristService = () => {
        props.setCurrentOptionService('delete');
        props.setPopup(null)
    }

    if (!props.currentTouristService && props.addOption !== 'new') {
        return (
            <div className="management-state">
                <h3>Pick an option to manage service in tour {props.popupData.name}</h3>
                <button onClick={handleAdditionOfNewTouristService} className="choice-btn">Add</button>
                <button onClick={handleEditionOfTouristService} className="choice-btn">Edit</button>
                <button onClick={handleDeletionOfTouristService} className="choice-btn">Delete</button>
            </div>
        );
    }

    switch(props.currentOptionService) {
        case 'add':
            return <ManagementAddComponent props={enhancedProps} />
        case 'edit':
            return <ManagementEditComponent props={enhancedProps} />
        case 'delete':
            return <ManagementDeleteComponent props={enhancedProps} />
        default:
            return null
    }
}

function ManagementEditComponent({props}) {
    const handleData = () => {
        props.setCurrentOptionService(null)
        props.setCurrentTouristService(null)
        props.setPopup(null)
        props.setView('trips-created')
    }


    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData.entries());

        try {
            const isVehicle = !!props.currentTouristService.vehicleType;
            const serviceType = isVehicle ? 'vehicle' : 'hotel';

            const response = await fetch(`/${serviceType}/${props.currentTouristService.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject)
            });

            if (response.ok) {
                alert('Tourist service updated successfully!');

                if (props.setBlockStateOrganiser) {
                    props.setBlockStateOrganiser(!props.blockStateOrganiser);
                }

                if (props.refreshTripData) {
                    props.refreshTripData();
                }
                const updatedData = await props.refetchFunction();
                props.setUserData(updatedData)
                handleData();

            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            console.error('Error updating tourist service:', error);
            alert('Failed to update tourist service');
        }
    }


    return (
        <form className="scrollableArea" onSubmit={handleSubmit}>
            {Object.entries(props.currentTouristService || {}).map(([key, value]) => {
                if (Array.isArray(value) || key === 'id' || key === 'state') return null;

                return (
                    <div key={key} className="form-field">
                        {typeof value !== "object" && (
                            <>
                                <label htmlFor={key}>
                                    <strong>{key}:</strong>
                                </label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    defaultValue={value?.toString()}
                                />
                            </>
                        )}
                    </div>
                );

            })}
            <button type="submit" className="choice-btn">
                Save changes
            </button>
        </form>
    )
}

function ManagementAddComponent({props}) {
    const [relation, setRelation] = useState('service');
    const [tempalte, setTemplate] = useState({})
    const [serviceType, setServiceType] = useState('')
    const [savedServiceData, setSavedServiceData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getServiceType(props.currentTouristService)
    }, []);

    const saveServiceToDatabase = async (serviceData, serviceType) => {
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = serviceType === 'hotel' ? '/hotel' : '/vehicle';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData)
            });


            if (!response.ok) {
                throw new Error(`Failed to save ${serviceType}: ${response.statusText}`);
            }

            const savedData = await response.json();

            setSavedServiceData(savedData);
            const updatedData = await props.refetchFunction();
            props.setUserData(updatedData)
            return savedData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const linkServiceToTrip = async (tripData, serviceId, serviceType, tripId) => {
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = `${serviceType === 'hotel' ? '/hotel-in-trip' : '/vehicle-in-trip'}/${tripId}/${serviceId}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                throw new Error(`Failed to link ${serviceType} to trip: ${response.statusText}`);
            }
            const result = await response.json();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceType = (service) => {
        if (!service) return null;

        if (service.serviceType) {
            return service.serviceType;
        }

        if (service.hotelAddress || service.hotelWebsite || service.hotelEmail || service.hotelInTripList || service === 'hotel') {
            setServiceType('hotel')

            return 'hotel';
        }

        if (service.vehicleType || service.driverCompany || service.vehicleInTripList || service === 'vehicle') {
            setServiceType('vehicle')

            return 'vehicle';
        }

        return null;
    };

    const getCurrentTemplate = (string) => {
        if (string === 'hotel') {
            setTemplate( {
                name: '',
                phoneNumbers: [],
                hotelAddress: '',
                hotelWebsite: '',
                hotelEmail: '',
                hotelInTripList: {
                    hotelStartDate: '',
                    hotelEndDate: ''
                }
                })

        } else if (string === 'vehicle') {
            setTemplate( {
                name: '',
                phoneNumbers: [],
                vehicleType: '',
                driverCompany: '',
                vehicleInTripList: {
                    startDate: '',
                    endDate: '',
                    startPoint: ''
                }
            })
        }
    };

    const handleRelation = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());

        const currentServiceType = props.addOption === 'copy'
            ? (serviceType)
            : serviceType;

        const phoneNumbers = formData.getAll('phoneNumbers[]');

        const vehicleRequestBody = {
            name: formObject.name,
            phoneNumbers: phoneNumbers || [],
            state: 'NotAssigned',
            vehicleType: formObject.vehicleType,
            driverCompany: formObject.driverCompany,
            organiserId: parseInt(props.currentUserId)
        };

        const hotelRequestBody = {
            name: formObject.name,
            phoneNumbers: phoneNumbers || [],
            state: 'NotAssigned',
            hotelWebsite: formObject.hotelWebsite,
            hotelAddress: formObject.hotelAddress,
            hotelEmail: formObject.hotelEmail,
            organiserId: parseInt(props.currentUserId)
        };

        const requestBody = currentServiceType === 'hotel' ? hotelRequestBody : vehicleRequestBody;

        try {
            const savedService = await saveServiceToDatabase(requestBody, currentServiceType);
            setRelation('trip');
        } catch (err) {
            console.error('Error saving service:', err);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());

        const currentServiceType = props.addOption === 'copy'
            ? (serviceType)
            : serviceType;

        const tripId = formObject.tripId;

        if (!tripId) {
            setError('Please select a trip');
            return;
        }

        if (!savedServiceData) {
            setError('No service data available. Please save the service first.');
            return;
        }

        try {
            const tripData = currentServiceType === 'hotel' ? {
                hotelStartDate: formObject.hotelStartDate,
                hotelEndDate: formObject.hotelEndDate
            } : {
                startDate: formObject.startDate,
                endDate: formObject.endDate,
                startPoint: formObject.startPoint
            };

            await linkServiceToTrip(tripData, savedServiceData, currentServiceType, tripId);
            const updatedData = await props.refetchFunction();
            props.setUserData(updatedData)
            setRelation('');
            setSavedServiceData(null);
            setServiceType('');
            setTemplate({});
            props.resetManagementState()

        } catch (err) {
            console.error('Error linking service to trip:', err);
        }
    }



    const [fieldCounts, setFieldCounts] = useState(() => {
        const counts = {};
        Object.entries(props.currentTouristService || []).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                counts[key] = value.length;
            }
        });
        return counts;
    });

    const addField = (fieldName) => {
        setFieldCounts(prev => ({
            ...prev,
            [fieldName]: (prev[fieldName] || 1) + 1
        }));
    };

    const removeField = (fieldName) => {
        setFieldCounts(prev => ({
            ...prev,
            [fieldName]: Math.max(1, (prev[fieldName] || 1) - 1)
        }));
    };

    if (isLoading) {
        return <div className="loading">Saving...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>Error: {error}</p>
                <button onClick={() => setError(null)}>Try Again</button>
            </div>
        );
    }

    if (relation === 'service')
        return (
            <div className="add-service-form">
                <h3>{props.addOption === 'copy' ? 'Edit Copied Service' : `Add New`}</h3>
                {props.addOption === 'new' && (
                    <div className="service-type-selection mb-4">
                        <label htmlFor="serviceType">
                            <strong>Service Type:</strong>
                        </label>
                        <select
                            id="serviceType"
                            value={serviceType}
                            onChange={(e) => {getCurrentTemplate(e.target.value); setServiceType(e.target.value)}}
                            className=""
                            required
                        >
                            <option value="">Select Service Type</option>
                            <option value="hotel">Hotel</option>
                            <option value="vehicle">Vehicle</option>
                        </select>
                    </div>
                )}

                {props.addOption === 'copy' && (
                    <div>
                        <p><strong>Service Type:</strong> {serviceType}</p>
                    </div>
                )}

                <form onSubmit={handleRelation}>

                    {

                        Object.entries(props.addOption === 'copy' ? props.currentTouristService : tempalte).map(([key, value]) => (
                            <div key={key} className="form-field">
                                {(!(key === 'id' || key === 'vehicleInTripList' || key === 'hotelInTripList' || key === 'state')) && (
                                    <label htmlFor={key}>
                                        <strong>{key}:</strong>
                                    </label>)}

                                {(Array.isArray(value) ? (
                                    <div className="array-fields">
                                        {Array.from({length: fieldCounts[key] || value.length}, (_, index) => (
                                            <div key={`${key}-${index}`} className="array-item">
                                                <input
                                                    type="text"
                                                    name={`${key}[]`}
                                                    defaultValue={props.addOption === 'copy' ? (value[index] || '') : ''}
                                                    placeholder={`${key} ${index + 1}`}
                                                    required
                                                />
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeField(key)}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addField(key)}
                                        >
                                            + Add {key}
                                        </button>
                                    </div>
                                ) : (!(key === 'hotelInTripList' || key === 'vehicleInTripList' || key === 'id' || key === 'state') && (
                                    <input
                                        type="text"
                                        name={key}
                                        defaultValue={props.addOption === 'copy' ? value : ''}
                                        required
                                    />
                                )))}
                            </div>
                        ))}
                    <button type="submit" className="choice-btn">Add Service</button>
                </form>
            </div>
        );

    if (relation === 'trip') {
        let tripData = props.currentTouristService?.[serviceType === 'hotel' ? 'hotelInTripList' : 'vehicleInTripList'] || {};

        if (props.addOption === 'new')
            tripData = tempalte?.[serviceType === 'hotel' ? 'hotelInTripList' : 'vehicleInTripList']

        return (
            <div className="add-service-form">
            <h3>Add an tourist service to tour</h3>
                <form onSubmit={handleSubmit}>
                    <select name="tripId" id="tripId">
                        <option value="">Choose a trip...</option>
                        {props.userData.trips.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                                {trip.name}
                            </option>
                        ))}
                    </select>
                    {Object.entries(tripData).map(([key, value]) => (
                        <div key={key} className="form-field">
                            {(!(key === 'vehicle' || key === 'hotel' || key === 'id')) && (<label htmlFor={key}>
                                <strong>{key}:</strong>
                            </label>)}

                            {(!(key === 'vehicle' || key === 'hotel' || key === 'id' || Array.isArray(value)) && (
                                    <input
                                        type="text"
                                        name={key}
                                        defaultValue={value || ''}
                                        className="w-full p-2 border rounded"
                                        required
                                    />)
                            )}
                        </div>
                    ))}
                    <button type="submit" className="choice-btn">Add Service</button>
                </form>
            </div>
        );
    }
}

function ManagementDeleteComponent({props}) {
    const [deleteOption, setDeleteOption] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [availableTrips, setAvailableTrips] = useState([]);
    const [confirmAction, setConfirmAction] = useState(false);

    useEffect(() => {
        if (deleteOption === 'from-trip') {
                const results = [];
                const trips = props.userData.trips
                for (const trip of trips) {
                    for (const hotel of trip.hotelsInTrip) {
                            if (props.currentTouristService.id === hotel.hotel.id) results.push({name: hotel.name, id: hotel.id, Type: 'hotel'});
                    }

                    for (const vehicle of trip.vehiclesInTrip) {
                        if (props.currentTouristService.id === vehicle.vehicle.id) results.push({name: vehicle.name, id: vehicle.id, Type: 'vehicle'});
                    }
                }

            setAvailableTrips(results || []);
        }
    }, [deleteOption]);

    const handleDeleteFromTrip = async () => {
        if (!selectedTrip || !props.currentTouristService) return;

        try {
            const isVehicle = !!props.currentTouristService.vehicleType;
            const serviceType = isVehicle ? 'vehicle' : 'hotel';


            const endpoint = `/${selectedTrip.Type}/trip/${selectedTrip.id}`;

            const response = await fetch(endpoint, { method: 'DELETE' });

            if (response.ok) {
                alert('Service removed from trip successfully!');

                if (props.refreshTripData) {
                    props.refreshTripData();
                }

            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            console.error('Error removing service from trip:', error);
            alert('Failed to remove service from trip');
        }
    };

    const handleDeleteFromSystem = async () => {
        if (!props.currentTouristService) return;

        try {
            const isVehicle = !!props.currentTouristService.vehicleType;
            const serviceType = isVehicle ? 'vehicle' : 'hotel';
            const endpoint = `/${serviceType}/${props.currentTouristService.id}`;

            const response = await fetch(endpoint, { method: 'DELETE' });

            if (response.ok) {
                alert('Service deleted from system successfully!');

                if (props.refreshTripData) {
                    props.refreshTripData();
                }

            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            alert('Failed to delete service from system');
        }
    };


    const handleConfirm = async () => {
        if (deleteOption === 'from-trip') {
            handleDeleteFromTrip();
        } else if (deleteOption === 'from-system') {
            handleDeleteFromSystem();
        }
        const updatedData = await props.refetchFunction();
        props.setUserData(updatedData)
        props.resetManagementState()
    };

    if (!deleteOption) {
        return (
            <div className="scrollableArea">
                <h3>Delete Tourist Service: {props.currentTouristService?.name}</h3>
                <p>Choose how you want to delete this service:</p>
                <button className="choice-btn" onClick={() => setDeleteOption('from-trip')}>
                    Remove from trip only
                </button>
                <button className="choice-btn" onClick={() => setDeleteOption('from-system')}>
                    Delete from entire system
                </button>
            </div>
        );
    }

    if (deleteOption === 'from-trip' && !selectedTrip && !confirmAction) {
        return (
            <div className="trip-selection">
                <h3>Select trip to remove service from</h3>
                <div className="trips-list">
                    {availableTrips.map(trip => (
                        <div key={trip.id} className="trip-item">
                            <p><strong>Trip:</strong> {trip.name}</p>
                            <button className="choice-btn" onClick={() => {
                                setSelectedTrip(trip);
                                setConfirmAction(true);
                            }}>
                                Select This Trip
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (confirmAction || deleteOption === 'from-system') {
        const actionText = deleteOption === 'from-trip'
            ? `remove "${props.currentTouristService?.name}" from trip "${selectedTrip?.name}"`
            : `permanently delete "${props.currentTouristService?.name}" from the entire system`;

        return (
            <div className="delete-confirmation">
                <h3>Confirm Delete Action</h3>
                <p>Are you sure you want to {actionText}?</p>
                {deleteOption === 'from-system' && (
                    <p><strong>Warning:</strong> This action cannot be undone and will remove the service from all trips!</p>
                )}
                <button className="choice-btn" onClick={handleConfirm}>Confirm Delete</button>
            </div>
        );
    }

    return null;
}