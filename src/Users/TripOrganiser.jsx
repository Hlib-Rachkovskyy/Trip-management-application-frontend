import {useEffect, useState} from "react";
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
                (<h1 className='black'>You currently viewing tourist service for trip: {props.touristServices}</h1>)}
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

    const refetchData = async () => {
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
        const data = await refetchData();
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

    const status = data.state || "Unknown";

    const handleClick = () => {
        if (isVehicle) {
            const vehicleDataWithList = {
                ...data.vehicle,
                vehicleInTripList: data.vehicleInTripList
            };
            props.setCurrentTouristService(vehicleDataWithList);

        } else if (isHotel) {
            const hotelDataWithExtra = {
                ...data.hotel,
                hotelInTripList: data.hotelInTripList
            };
            props.setCurrentTouristService(hotelDataWithExtra);
        }
        console.log(data.vehicleInTripList);
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
                <p>Status: {status}</p>
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
    const [currentTouristService, setCurrentTouristService] = useState('')

    useEffect(() => {
        setCurrentTouristService(props.currentTouristService)
    }, [props.currentTouristService]);

    const resetManagementState = () => {
        props.setCurrentOptionService(null);
        props.setCurrentTouristService(null);
        props.setPopup(null);
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

    if (!currentTouristService) {
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
            props.setCurrentOptionService(null);
            return null;
    }
}

function ManagementEditComponent({props}) {
    const handleData = () => {
        props.setCurrentOptionService(null)
        props.setCurrentTouristService(null)
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
                if (Array.isArray(value) || key === 'id') return null;

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
                Save changes
            </button>
        </form>
    )
}

function ManagementAddComponent({props}) {
    const [addOption, setAddOption] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [availableServices, setAvailableServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [relation, setRelation] = useState('service');

    useEffect(() => {
        if (addOption === 'copy' && serviceType) {
           // fetchAvailableServices();
        }
    }, [addOption, serviceType]);




    const fetchAvailableServices = async () => {
        setLoading(true);
        try {
            const endpoint = serviceType === 'hotel' ? '/hotel' : '/vehicle';
            const response = await fetch(endpoint);
            const services = await response.json();
            setAvailableServices(services);
        } catch (error) {
            console.error('Error fetching services:', error);
            alert('Failed to fetch available services');
        } finally {
            setLoading(false);
        }
    };

    const handleRelation = async (e) => {
        e.preventDefault();
        console.log(props.popupData)
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());

        const vehicleRequestBody = {
            id: 1,
            name: formObject.name,
            phoneNumbers: formObject.phoneNumbers || [],
            state: formObject.state ? 'NotAsigned' : 'Asigned',
            vehicle_type: formObject.vehicle_type,
            driver_company: formObject.driver_company,

            organiserId: parseInt(formObject.organiserId)
        };


        const hotelRequestBody = {
            id: 1,
            name: formObject.name,
            phoneNumbers: formObject.phoneNumbers || [],
            state: formObject.state ? 'NotAsigned' : 'Asigned',
            hotelWebsite: formObject.hotelWebsite,
            hotelAddress: formObject.hotelAddress,
            hotelEmail: formObject.hotelEmail,

            organiserId: parseInt(formObject.organiserId)
        };

        setRelation('trip');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());


        const vehicleInTripRequestBody = {
            id: 1,
            endDate: formObject.end_date,
            startDate: formObject.start_date,
            startPoint: formObject.start_point,
        }



        const hotelInTripRequestBody = {
            id: 1,
            hotelEndDate: formObject.hotel_end_date,
            hotelStartDate: formObject.hotel_start_date,
        }
        try {
            const endpoint = serviceType === 'hotel' ? '/hotel' : '/vehicle';
            const requestBody = serviceType === 'hotel' ? hotelInTripRequestBody : vehicleInTripRequestBody;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                alert('Service added successfully!');
            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            console.error('Error adding service:', error);
            alert('Failed to add service');
        }
    };

    const [fieldCounts, setFieldCounts] = useState(() => {
        const counts = {};
        Object.entries(props.currentTouristService).forEach(([key, value]) => {
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

    if (!props.currentTouristService) {
        return (
            <div className="service-type-selection">
                <h3>Choose Tourist Service Type</h3>
                <p>What type of service would you like to add?</p>
                <button
                    className="choice-btn"
                    onClick={() => {
                        setServiceType('hotel');
                        const templateHotel = {
                            id: null,
                            name: '',
                            phoneNumbers: [''],
                            hotelAddress: '',
                            hotelWebsite: '',
                            hotelEmail: '',
                            organiserId: '',
                            hotelInTripList: {
                                hotelStartDate: '',
                                hotelEndDate: ''
                            }
                        };
                        props.setCurrentTouristService(templateHotel);
                    }}
                >
                    Add Hotel
                </button>
                <button
                    className="choice-btn"
                    onClick={() => {
                        setServiceType('vehicle');
                        const templateVehicle = {
                            id: null,
                            name: '',
                            phoneNumbers: [''],
                            vehicleType: '',
                            driverCompany: '',
                            organiserId: '',
                            vehicleInTripList: {
                                startDate: '',
                                endDate: '',
                                startPoint: ''
                            }
                        };
                        props.setCurrentTouristService(templateVehicle);
                    }}
                >
                    Add Vehicle
                </button>
            </div>
        );
    }


    if (!addOption) {
        return (
            <div className="add-service-options">
                <h3>Add New Tourist Service</h3>
                <p>Choose how you want to add a new service:</p>
                <button className="choice-btn" onClick={() => setAddOption('copy')}>
                    Create as copy of existing service
                </button>
                <button className="choice-btn" onClick={() => setAddOption('new')}>
                    Create completely new service
                </button>
            </div>
        );
    }


    if (relation === 'service')
    return (
        <div className="add-service-form">
            <h3>{addOption === 'copy' ? 'Edit Copied Service' : `Add New ${serviceType}`}</h3>
            <form onSubmit={handleRelation}>
                { Object.entries(props.currentTouristService).map(([key, value]) => (
                    <div key={key} className="form-field">
                        {!(key === 'id' || key === 'state') && (<label htmlFor={key}>
                            <strong>{key}:</strong>
                        </label>)}

                        {Array.isArray(value) ? (
                            <div className="array-fields">
                                {Array.from({ length: fieldCounts[key] || value.length }, (_, index) => (
                                    <div key={`${key}-${index}`} className="array-item">
                                        <input
                                            type="text"
                                            name={`${key}[]`}
                                            defaultValue={value[index] || ''}
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
                        ) : (!(key === 'id' || key === 'state') && (
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

    if (relation === 'trip')
    return (
        <div className="add-service-form">
            <h3>{addOption === 'copy' ? 'Edit Copied Service' : `Add New ${serviceType}`}</h3>
            <form onSubmit={handleSubmit}>
                { Object.entries(props.currentTouristService.vehicleInTripList).map(([key, value]) => (
                    <div key={key} className="form-field">
                        {!(key === 'id' || key === 'state') && (<label htmlFor={key}>
                            <strong>{key}:</strong>
                        </label>)}

                        {

                        (!(key === 'id' || key === 'state' || Array.isArray(value)) && (
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

function ManagementDeleteComponent({props}) {
    const [deleteOption, setDeleteOption] = useState('');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [availableTrips, setAvailableTrips] = useState([]);
    const [confirmAction, setConfirmAction] = useState(false);

    useEffect(() => {
        if (deleteOption === 'from-trip') {
            setAvailableTrips(props.userData.trips || []);
        }
    }, [deleteOption]);

    const handleDeleteFromTrip = async () => {
        if (!selectedTrip || !props.currentTouristService) return;

        try {
            const isVehicle = !!props.currentTouristService.vehicleType;
            const serviceType = isVehicle ? 'vehicle' : 'hotel';


            const endpoint = `/${serviceType}/${props.currentTouristService.id}/trip/${props.popupData.id}`;

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


    const handleConfirm = () => {
        if (deleteOption === 'from-trip') {
            handleDeleteFromTrip();
        } else if (deleteOption === 'from-system') {
            handleDeleteFromSystem();
        }
    };

    if (!deleteOption) {
        return (
            <div className="delete-service-options">
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
                            <p><strong>Start Date:</strong> {trip.startDate}</p>
                            <p><strong>End Date:</strong> {trip.endDate}</p>
                            <button className="choice-btn" onClick={() => {
                                setSelectedTrip(trip);
                                setConfirmAction(true);
                            }}>
                                Select This Trip
                            </button>
                        </div>
                    ))}
                </div>
                <button className="choice-btn" onClick={() => setDeleteOption('')}>Back</button>
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
                <button className="choice-btn" onClick={() => {
                    if (deleteOption === 'from-trip') {
                        setConfirmAction(false);
                        setSelectedTrip(null);
                    } else {
                        setDeleteOption('');
                    }
                }}>
                    Cancel
                </button>
            </div>
        );
    }

    return null;
}