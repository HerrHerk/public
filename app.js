//------------------------------------------------------------
// IMPORTS
//------------------------------------------------------------


import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js"
const db = getFirestore();
const dbRef = collection(db, "materials");

//------------------------------------------------------------
// MOBILE VIEW
//------------------------------------------------------------

const leftCol = document.getElementById("left-col");
const rightCol = document.getElementById("right-col");
const backBtn = document.getElementById("back-btn");

backBtn.addEventListener("click", e => {
    leftCol.style.display = "block";
    rightCol.style.display = "none";
});

const toggleLeftAndRightViewsOnMobile = () => {
    if (document.body.clientWidth <= 600) {
        leftCol.style.display = "none";
        rightCol.style.display = "block";
    }
}


//------------------------------------------------------------
// FONT SIZE BASED ON SCREEN
//------------------------------------------------------------

// Example: Adjust root font size based on screen width



//------------------------------------------------------------
// GET DATA
//------------------------------------------------------------

let contacts = [];


const getContacts = async() => {
    
    try {
        
        //const docSnap = await getDocs(dbRef);

        await onSnapshot(dbRef, docsSnap => {

            contacts = [];

            docsSnap.forEach(doc => {
            
                const contact = doc.data();
                contact.id = doc.id;
                contacts.push(contact);
                
                // console.log(doc.data());         EVERYTHING IS FETCHED
                // console.log(doc.data().material);   ONLY material IS FETCHED
                // console.log(doc.id);             ONLY ID IS FETCHED
            })
    
            showContacts(contacts);
        });

    } catch(err) {
        console.log("getContacts =" + err);
    }

}

getContacts();

//------------------------------------------------------------
// SHOW CONTACT AS LIST ITEM ON THE LEFT
//------------------------------------------------------------

const showContacts = (contacts) => {
    // Clear all contact lists first
    const contactLists = {
      steel: document.getElementById("contact-list-steel"),
      aluminium: document.getElementById("contact-list-aluminium"),
      iron: document.getElementById("contact-list-iron"),
      other: document.getElementById("contact-list-other")
    };
  
    for (let list in contactLists) {
      if (contactLists.hasOwnProperty(list)) {
        contactLists[list].innerHTML = "";
      }
    }

    // Sort contacts alphabetically by name
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    contacts.forEach(contact => {

        const li = `<li class="contact-list-item" id="${contact.id}">

                    <div class="media">
                        <div class="two-letters">AB</div>
                    </div>
                        
                    <div class="content">
                        <div class="title">
                            ${contact.name}
                        </div>
                        <div class="subtitle">
                            ${contact.version}
                        </div>
                    </div>

                    <div class="action">
                        <button class="edit-user">
                            edit
                        </button>
                        <button class="delete-user">
                            delete
                        </button>
                        <button class="download-btn">
                            download
                        </button>
                    </div>
                </li>`;

    // Determine the contact list based on contact.material
    if (contact.material && contactLists[contact.material.toLowerCase()]) {
        contactLists[contact.material.toLowerCase()].innerHTML += li;
      } else {
        console.error(`Unknown material: ${contact.material}`);
      }
    });
};

//------------------------------------------------------------
// CLICK CONTACT LIST ITEM
//------------------------------------------------------------





const contactListPressed = (event) => {
    const id = event.target.closest("li").getAttribute("id");
    const action = document.querySelectorAll('.contact-list-item .action');
    // console.log (id);

    if(event.target.className === "edit-user") {
        editButtonPressed(id);

    } else if(event.target.className === "delete-user") {
        deleteButtonPressed(id);

    } else if(event.target.className === "download-btn") {
        downloadButtonPressed(id);
    
    } else {
        displayContactOnDetailsView(id);
        toggleLeftAndRightViewsOnMobile();
        //action.style.display = 'block';
        
    }

    
}


// Add event listeners to all contact lists
const addEventListenersToContactLists = () => {
    const contactListSelectors = ["#contact-list-steel", "#contact-list-aluminium", "#contact-list-iron", "#contact-list-other"];
    contactListSelectors.forEach(selector => {
      const contactList = document.querySelector(selector);
      if (contactList) {
        contactList.addEventListener("click", contactListPressed);
      }
    });
  };
  
  // Call the function to add event listeners after DOM content is loaded
  document.addEventListener('DOMContentLoaded', function() {
    addEventListenersToContactLists();
});

//------------------------------------------------------------
// EDIT DATA
//------------------------------------------------------------

const editButtonPressed = (id) => {
    modalOverlay.style.display = "flex";
    const contact = getContact(id);

    name.value = contact.name;
    version.value = contact.version;
    initial_failure_strain.value = contact.initial_failure_strain;
    initial_yield_strength.value = contact.initial_yield_strength;
    material.value = contact.material;

    modalOverlay.setAttribute("contact-id", contact.id);
}

//------------------------------------------------------------
// DELETE DATA
//------------------------------------------------------------

const deleteButtonPressed = async (id) => {

    const isConfirmed = confirm("Are you sure you want to delete it?");

    if (isConfirmed) {
        try {
            const docRef = doc(db, "materials", id);
            await deleteDoc(docRef);
        } catch(e) {
            setErrorMessage("error", "Unable to delete user data from the database. Please try again later");
            showErrorMessages();
        }
    }
}


//------------------------------------------------------------
// DOWNLOAD DATA
//------------------------------------------------------------

const downloadButtonPressed = async (id) => {
    const contact = getContact(id);

    // Get the date
    const currentDate = new Date();

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
    
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    };
    
    const formattedDate = formatDate(currentDate);

    // Generate a consistent random color based on the material name
    var materialName = `${contact.name} (${contact.version})`;
    var color = generateColor(materialName);

    // Values to be inserted into the XML template
    var values = {
        version: "18.2.0.210", // 1st value should be adjsuted based on ANSYS version, if there are compatibily issues
        versiondate: formattedDate, // Use the formatted current date and time
        pr0_pa0: color.red.toString(), // Red
        pr0_pa1: color.green.toString(), // Green
        pr0_pa2: color.blue.toString(), // Blue
        pr0_pa3: "Appearance",
        pr1_pa4: "Interpolation Options",
        pr1_pa5: contact.density, // Density
        pr1_pa6: "7.88860905221012e-31",
        pr2_pa4: "Interpolation Options",
        pr2_pa7: contact.e_modulus, // Young's Modulus
        pr2_pa8: contact.poisson, // Poisson's Ratio
        pr2_pa9: "69607843137.2549",
        pr2_pa10: "26691729323.3083",
        pr2_pa6: "7.88860905221012e-31",
        pr3_pa11: contact.initial_yield_strength, // Initial Yield Stress
        pr3_pa12: contact.hardening_constan, // Hardening Constant
        pr3_pa13: contact.hardening_exponent, // Hardening Exponent
        pr3_pa14: contact.strain_rate_constant, // Strain Rate Constant
        pr3_pa15: contact.thermal_softening_exp, // Thermal Softening Exponent
        pr3_pa16: contact.melting_temperature, // Melting Temperature
        pr3_pa17: contact.reference_strain_rate, // Reference Strain Rate (/sec)
        pr4_pa4: "Interpolation Options",
        pr4_pa18: contact.specific_heat, // Specific Heat
        pr4_pa6: "7.88860905221012e-31",
        pr5_pa19: contact.initial_failure_strain, // Damage Constant D1
        pr5_pa20: contact.exponential_factor, // Damage Constant D2
        pr5_pa21: contact.triaxial_factor, // Damage Constant D3
        pr5_pa22: contact.strain_rate_factor, // Damage Constant D4
        pr5_pa23: contact.temperature_factor, // Damage Constant D5
        pr5_pa16: contact.melting_temperature, // Melting Temperature
        pr5_pa17: contact.reference_strain_rate, // Reference Strain Rate (/sec)
        pr6_pa24: contact.grueneisen_coefficient, // Gruneisen Coefficient
        pr6_pa25: contact.parameter_c1, // Parameter C1
        pr6_pa26: contact.parameter_s1, // Parameter S1
        pr6_pa27: contact.parameter_quadratic, // Parameter Quadratic S2
        pr7_pa10: contact.shear_modulus, // Shear Modulus
        material_name: materialName // Dynamic material_name variable
    }; 

    // Fetch the XML template
    const response = await fetch('mat-template.xml');
    let xmlTemplate = await response.text();


    // Replace placeholders with values
    for (var key in values) {
        xmlTemplate = xmlTemplate.replace(new RegExp('{{' + key + '}}', 'g'), values[key]);
    }

    // Create a Blob with the XML content
    const blob = new Blob([xmlTemplate], { type: 'application/xml' });
    // Create a link element
    const link = document.createElement('a');
    // Create a URL for the Blob
    link.href = URL.createObjectURL(blob);
    // Set the download attribute with the desired file name
    link.download = materialName + '.xml';
    // Append the link to the body (necessary for some browsers)
    document.body.appendChild(link);
    // Programmatically click the link to trigger the download
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);

}

// Function to generate a consistent random color based on the material name
function generateColor(materialName) {
    // Calculate the hash of the material name
    var hash = 0;
    if (materialName.length == 0) return hash;
    for (var i = 0; i < materialName.length; i++) {
      var char = materialName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use the hash to determine the RGB values
    var red = Math.abs(hash) % 256;
    var green = Math.abs((hash >> 8)) % 256;
    var blue = Math.abs((hash >> 16)) % 256;
    
    // Return the RGB values as an object
    return { red: red, green: green, blue: blue };
}


//------------------------------------------------------------
// DISPLAY DETAILS VIEW ON LIST ITEM CLICK
//------------------------------------------------------------

const getContact = (id) => {
    return contacts.find(contact => {
        return contact.id === id;
    })
}



const displayContactOnDetailsView = (id) => {
    const contact = getContact(id);
    const rightColDetail = document.getElementById("right-col-detail");

    // Function to check if value is null or empty and return "n/a" if so
    const formatValue = (value) => value ? value : 'n/a';

    rightColDetail.innerHTML = `


        <div class="card-mat-container">

            <div class="card-mat">
                <div class="mat-header">Johnson Cook Strength</div>
                <div class="mat-row ${!contact.initial_yield_strength ? 'missing-data' : ''}">
                    <div class="mat-property">Initial Yield Strength:</div>
                    <div class="mat-data">${formatValue(contact.initial_yield_strength)}</div>
                    <div class="mat-unit">[MPa]</div>
                </div>
                <div class="mat-row ${!contact.hardening_constan ? 'missing-data' : ''}">
                    <div class="mat-property">Hardening Constant:</div>
                    <div class="mat-data">${formatValue(contact.hardening_constan)}</div>
                    <div class="mat-unit">[MPa]</div>
                </div>
                <div class="mat-row ${!contact.hardening_exponent ? 'missing-data' : ''}">
                    <div class="mat-property">Hardening Exponent:</div>
                    <div class="mat-data">${formatValue(contact.hardening_exponent)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.strain_rate_constant ? 'missing-data' : ''}">
                    <div class="mat-property">Strain Rate Constant:</div>
                    <div class="mat-data">${formatValue(contact.strain_rate_constant)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.thermal_softening_exp ? 'missing-data' : ''}">
                    <div class="mat-property">Thermal Softening Exp:</div>
                    <div class="mat-data">${formatValue(contact.thermal_softening_exp)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.melting_temperature ? 'missing-data' : ''}">
                    <div class="mat-property">Melting Temperature:</div>
                    <div class="mat-data">${formatValue(contact.melting_temperature)}</div>
                    <div class="mat-unit">[K]</div>
                </div>
                <div class="mat-row ${!contact.reference_strain_rate ? 'missing-data' : ''}">
                    <div class="mat-property">Reference Strain Rate:</div>
                    <div class="mat-data">${formatValue(contact.reference_strain_rate)}</div>
                    <div class="mat-unit">[1/s]</div>
                </div>
            </div>

            <div class="card-mat">
                <div class="mat-header">Johnson Cook Failure</div>
                <div class="mat-row ${!contact.initial_failure_strain ? 'missing-data' : ''}">
                    <div class="mat-property">Initial Failure Strain:</div>
                    <div class="mat-data">${formatValue(contact.initial_failure_strain)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.exponential_factor ? 'missing-data' : ''}">
                    <div class="mat-property">Exponential Factor:</div>
                    <div class="mat-data">${formatValue(contact.exponential_factor)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.triaxial_factor ? 'missing-data' : ''}">
                    <div class="mat-property">Triaxial Factor:</div>
                    <div class="mat-data">${formatValue(contact.triaxial_factor)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.strain_rate_factor ? 'missing-data' : ''}">
                    <div class="mat-property">Strain Rate Factor:</div>
                    <div class="mat-data">${formatValue(contact.strain_rate_factor)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.thermal_softening_exp ? 'missing-data' : ''}">
                    <div class="mat-property">Temperature Factor:</div>
                    <div class="mat-data">${formatValue(contact.temperature_factor)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.melting_temperature ? 'missing-data' : ''}">
                    <div class="mat-property">Melting Temperature:</div>
                    <div class="mat-data">${formatValue(contact.melting_temperature)}</div>
                    <div class="mat-unit">[K]</div>
                </div>
                <div class="mat-row ${!contact.reference_strain_rate ? 'missing-data' : ''}">
                    <div class="mat-property">Reference Strain Rate:</div>
                    <div class="mat-data">${formatValue(contact.reference_strain_rate)}</div>
                    <div class="mat-unit">[1/s]</div>
                </div>
            </div>

            <div class="card-mat">
                <div class="mat-header">Isotropic Elasticity</div>
                <div class="mat-row ${!contact.e_modulus ? 'missing-data' : ''}">
                    <div class="mat-property">Young's Modulus:</div>
                    <div class="mat-data">${formatValue(contact.e_modulus)}</div>
                    <div class="mat-unit">[GPa]</div>
                </div>
                <div class="mat-row ${!contact.poisson ? 'missing-data' : ''}">
                    <div class="mat-property">&#957-Poisson Ratio:</div>
                    <div class="mat-data">${formatValue(contact.poisson)}</div>
                    <div class="mat-unit">[GPa]</div>
                </div>
                <div class="mat-row ${!contact.shear_modulus ? 'missing-data' : ''}">
                    <div class="mat-property">Shear Modulus:</div>
                    <div class="mat-data">${formatValue(contact.shear_modulus)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.bulk_modulus ? 'missing-data' : ''}">
                    <div class="mat-property">Bulk Modulus:</div>
                    <div class="mat-data">${formatValue(contact.bulk_modulus)}</div>
                    <div class="mat-unit">[GPa]</div>
                </div>
            </div>

            <div class="card-mat">
                <div class="mat-header">Shock EOS</div>
                <div class="mat-row ${!contact.grueneisen_coefficient ? 'missing-data' : ''}">
                    <div class="mat-property">&#947-Grueneisen Coefficient:</div>
                    <div class="mat-data">${formatValue(contact.grueneisen_coefficient)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.parameter_c1 ? 'missing-data' : ''}">
                    <div class="mat-property">Parameter C1:</div>
                    <div class="mat-data">${formatValue(contact.parameter_c1)}</div>
                    <div class="mat-unit">[m/s]</div>
                </div>
                <div class="mat-row ${!contact.parameter_s1 ? 'missing-data' : ''}">
                    <div class="mat-property">Parameter S1:</div>
                    <div class="mat-data">${formatValue(contact.parameter_s1)}</div>
                    <div class="mat-unit">[-]</div>
                </div>
                <div class="mat-row ${!contact.parameter_quadratic ? 'missing-data' : ''}">
                    <div class="mat-property">Parameter Quadratic:</div>
                    <div class="mat-data">${formatValue(contact.parameter_quadratic)}</div>
                    <div class="mat-unit">[s/m]</div>
                </div>
            </div>

            <div class="card-mat">
                <div class="mat-header">Physical Properties</div>
                <div class="mat-row ${!contact.density ? 'missing-data' : ''}">
                    <div class="mat-property">Density:</div>
                    <div class="mat-data">${formatValue(contact.density)}</div>
                    <div class="mat-unit">[kg/m3]</div>
                </div>
                <div class="mat-row ${!contact.specific_heat ? 'missing-data' : ''}">
                    <div class="mat-property">Specific Heat Const. Pr.:</div>
                    <div class="mat-data">${formatValue(contact.specific_heat)}</div>
                    <div class="mat-unit">[J/kgK]</div>
                </div>
            </div>

            <div class="card-mat">
                <div class="mat-header">Other</div>
                <div class="mat-row ${!contact.hardness ? 'missing-data' : ''}">
                    <div class="mat-property">Hardness:</div>
                    <div class="mat-data">${formatValue(contact.hardness)}</div>
                    <div class="mat-unit">[BHN]</div>
                </div>
                <div class="mat-row ${!contact.source ? 'missing-data' : ''}">
                    <div class="mat-property">Source:</div>
                    <div class="mat-data">${formatValue(contact.source)}</div>
                    <div class="mat-unit"></div>
                </div>
                <div class="mat-row ${!contact.reference ? 'missing-data' : ''}">
                    <div class="mat-property">Reference:</div>
                    <div class="mat-data">
                        <a href="${contact.reference}" target="_blank" class="reference-link">Link</a>
                    </div>
                    <div class="mat-unit"></div>
                </div>
            </div>
        </div>

        <div class="card-chart-container">    

            <div class="card-chart">
                <div class="mat-header">Chart of Johnson Cook Strength</div>
                <canvas class= "chart-canv" id="chart-johnson-cook-strength"></canvas>
            </div>

            <div class="card-chart">
                <div class="mat-header">Chart of Johnson Cook Failure</div>
                <canvas "chart-canv" id="chart-johnson-cook-failure"></canvas>
            </div>
        </div>
    `;

    // Initialize charts after rendering
    setTimeout(() => {
        initializeCharts(id);
    }, 0);
};

//------------------------------------------------------------
// CHART
//------------------------------------------------------------

const initializeCharts = (id) => {
    const ctxStrength = document.getElementById('chart-johnson-cook-strength').getContext('2d');
    const ctxFailure = document.getElementById('chart-johnson-cook-failure').getContext('2d');
    const { xValues, f1Values, f100Values, f1000Values } = generateJCSchart(id);
    const { xValuesJCF, f1ValuesJCF, f100ValuesJCF, f1000ValuesJCF } = generateJCFchart(id);

    new Chart(ctxStrength, {
        type: 'line',
        data: {
            labels: xValues, // Use the generated xValues for the X-axis labels
            datasets: [
                {
                    label: '1/s',
                    data: f1Values, // Use the generated f1Values for the dataset
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: '100/s',
                    data: f100Values, // Use the generated f100Values for the dataset
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: '1000/s',
                    data: f1000Values, // Use the generated f1000Values for the dataset
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 3,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Plastic Strain [%]',
                        color: 'white',

                    },
                    ticks: {
                        color: 'white',

                        
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Yield Stress [MPa]',
                        color: 'white',

                    },
                    ticks: {
                        color: 'white',

                        
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });


    new Chart(ctxFailure, {
        type: 'line',
        data: {
            labels: xValuesJCF, // Use the generated xValues for the X-axis labels
            datasets: [
                {
                    label: '1/s',
                    data: f1ValuesJCF, // Use the generated f1Values for the dataset
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: '100/s',
                    data: f100ValuesJCF, // Use the generated f100Values for the dataset
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: '1000/s',
                    data: f1000ValuesJCF, // Use the generated f1000Values for the dataset
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 3,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'σ∗',
                        color: 'white',

                    },
                    ticks: {
                        color: 'white',

                        
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Plastic Failure Strain εf',
                        color: 'white',

                    },
                    ticks: {
                        color: 'white',

                        
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });
};




const generateJCSchart = (id) => {
    const contact = getContact(id);

    // Assign extracted values to corresponding variables
    var aJCS = parseFloat(contact.initial_yield_strength);
    var bJCS = parseFloat(contact.hardening_constan);
    var nJCS = parseFloat(contact.hardening_exponent);
    var cJCS = parseFloat(contact.strain_rate_constant);
    var eJCS = parseFloat(contact.reference_strain_rate);

    // Use the extracted values to generate chart data
    const stepSizeJCS = 0.0001;
    const xValuesJCS = [];
    const f1ValuesJCS = [];
    const f100ValuesJCS = [];
    const f1000ValuesJCS = [];

    for (let xJCS = 0; xJCS <= 0.156; xJCS += stepSizeJCS) {
        const f1JCS = (aJCS + bJCS * Math.pow(xJCS, nJCS)) * (1 + cJCS * Math.log(1 * eJCS));
        const f100JCS = (aJCS + bJCS * Math.pow(xJCS, nJCS)) * (1 + cJCS * Math.log(100 * eJCS));
        const f1000JCS = (aJCS + bJCS * Math.pow(xJCS, nJCS)) * (1 + cJCS * Math.log(1000 * eJCS));

        xValuesJCS.push(xJCS); // Push x value into xValues array
        f1ValuesJCS.push(f1JCS);
        f100ValuesJCS.push(f100JCS);
        f1000ValuesJCS.push(f1000JCS);
    }

    // Round xValues to three decimal places
    const roundedXValuesJCS = xValuesJCS.map(xJCS => parseFloat(xJCS.toFixed(3)));

    // Multiply rounded xValues by 100
    const multipliedXValuesJCS = roundedXValuesJCS.map(xJCS => xJCS * 100);

    // Round xValues to three decimal places
    const roundedmultipliedXValuesJCS = multipliedXValuesJCS.map(xJCS => parseFloat(xJCS.toFixed(3)));

    return { xValues: roundedmultipliedXValuesJCS, f1Values: f1ValuesJCS, f100Values: f100ValuesJCS, f1000Values: f1000ValuesJCS };
}

const generateJCFchart = (id) => {
    const contact = getContact(id);

    // Assign extracted values to corresponding variables
    var d1JCF = parseFloat(contact.initial_failure_strain);
    var d2JCF = parseFloat(contact.exponential_factor);
    var d3JCF = parseFloat(contact.triaxial_factor);
    var d4JCF = parseFloat(contact.strain_rate_factor);
    var eJCF = parseFloat(contact.reference_strain_rate);

    // Use the extracted values to generate chart data
    const stepSizeJCF = 0.001;
    const xValuesJCF = [];
    const f1ValuesJCF = [];
    const f100ValuesJCF = [];
    const f1000ValuesJCF = [];

    for (let xJCF = -0.5; xJCF <= 0.6; xJCF += stepSizeJCF) {
        const f1JCF = (d1JCF + d2JCF * Math.exp(d3JCF * xJCF)) * (1 + d4JCF * Math.log(1 * eJCF));
        const f100JCF = (d1JCF + d2JCF * Math.exp(d3JCF * xJCF)) * (1 + d4JCF * Math.log(100 * eJCF));
        const f1000JCF = (d1JCF + d2JCF * Math.exp(d3JCF * xJCF)) * (1 + d4JCF * Math.log(1000 * eJCF));

        xValuesJCF.push(xJCF); // Push x value into xValues array
        f1ValuesJCF.push(f1JCF);
        f100ValuesJCF.push(f100JCF);
        f1000ValuesJCF.push(f1000JCF);
    }

    // Round xValues to three decimal places
    const roundedXValuesJCF = xValuesJCF.map(xJCF => parseFloat(xJCF.toFixed(2)));
    
    // Multiply rounded xValues by 100
    const multipliedXValuesJCF = roundedXValuesJCF.map(xJCF => xJCF * 100);

    // Round xValues to three decimal places
    const roundedmultipliedXValuesJCF = multipliedXValuesJCF.map(xJCF => parseFloat(xJCF.toFixed(3)));

    return { xValuesJCF: roundedXValuesJCF, f1ValuesJCF: f1ValuesJCF, f100ValuesJCF: f100ValuesJCF, f1000ValuesJCF: f1000ValuesJCF };
}


//------------------------------------------------------------
// MODAL
//------------------------------------------------------------

const addBtn = document.querySelector(".add-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.querySelector(".close-btn");

const addButtonPressed = () => {
    modalOverlay.style.display = "flex";
    modalOverlay.removeAttribute("contact-id");

    name.value = "";
    version.value = "";
    initial_failure_strain.value = "";
    initial_yield_strength.value = "";
    material.value = "";
}

const closeButtonPressed = () => {
    modalOverlay.style.display = "none";
}

const hideModal = (e) => {
    
    if (e instanceof Event) {
        // console.log(e.target);
        // onsole.log(e.currenTtarget);
    
        if (e.target === e.currentTarget) {
            modalOverlay.style.display = "none";
        }         
    } else {
        modalOverlay.style.display = "none";
    }

}

addBtn.addEventListener("click", addButtonPressed);
closeBtn.addEventListener("click", closeButtonPressed);
modalOverlay.addEventListener("click", hideModal);

//------------------------------------------------------------
// FORM VALIDATION AND ADD DATA
//------------------------------------------------------------

const saveBtn = document.querySelector(".save-btn");
const error = {};

const name = document.getElementById("name"),
      version = document.getElementById("version"),
      initial_failure_strain = document.getElementById("initial_failure_strain"),
      initial_yield_strength = document.getElementById("initial_yield_strength"),
      material = document.getElementById("material");

const saveButtonPressed = async() => {
    checkRequired([name, version, initial_failure_strain, initial_yield_strength, material]);
    checkmaterial(material);
    checkInputLength(initial_failure_strain, 2);
    checkInputLength(initial_yield_strength, 10);
    showErrorMessages();

    if (Object.keys(error).length === 0) {

        if(modalOverlay.getAttribute("contact-id")) {
            // update data
            const docRef = doc(db, "materials", modalOverlay.getAttribute("contact-id"));

            try {
                
                await updateDoc(docRef, {
                    name: name.value,
                    version: version.value,
                    initial_failure_strain: initial_failure_strain.value,
                    initial_yield_strength: initial_yield_strength.value,
                    material: material.value
                });

                hideModal();

            } catch(e) {
                setErrorMessage("error", "Unable to update user data to the database. Please try again later");
                showErrorMessages();
            }



        } else {
            // add data
            try {
                await addDoc(dbRef, {
                    name: name.value,
                    version: version.value,
                    initial_failure_strain: initial_failure_strain.value,
                    initial_yield_strength: initial_yield_strength.value,
                    material: material.value
                });
                hideModal();
                // here
            } catch (err) {
                setErrorMessage("error", "Unable to add user data to the database. Please try again later");
                showErrorMessages();
            }
        }

    }
}

const checkRequired = (inputArray) => {
    inputArray.forEach(input => {
        if (input.value.trim() === "") {
            // console.log(input.id + " is empty");
            setErrorMessage(input, input.id + " is empty");
        } else {
            deleteErrorMessage(input);
        }
    });
    console.log(error);
}

const setErrorMessage = (input, message) => {
    if (input.nodeName === "INPUT") {
        error[input.id] = message;
        input.style.border = "1px solid red";
    } else {
        error[input] = message;
    }

}

const deleteErrorMessage = (input) => {
    delete error[input.id];
    input.style.border = "1px solid green";
}

const checkInputLength = (input, number) => {
    if (input.value.trim() !== "") {
        if(input.value.trim().length === number) {
            deleteErrorMessage(input);
        } else {
            setErrorMessage(input, input.id + ` must be ${number} digits`);
        }
    }
}



const checkmaterial = (input) => {
    if(input.value.trim() !== "") {
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if(re.test(input.value.trim())) {
            deleteErrorMessage(input);
        } else {
            setErrorMessage(input, input.id + " is invalid");
        }
    }
}

const showErrorMessages = () => {
    const errorLabel = document.getElementById("error-label");

errorLabel.innerHTML = "";
    for (const key in error){
        const li = document.createElement("li");
        li.innerText = error[key];
        li.style.color = "red";
        errorLabel.appendChild(li);
    }
}

saveBtn.addEventListener("click", saveButtonPressed);




//------------------------------------------------------------
// TABS
//------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
    var tabs = document.querySelectorAll('.tab');
    var contents = document.querySelectorAll('.tab-content');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            tabs.forEach(function (tab) {
            tab.classList.remove('active');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all contents
            contents.forEach(function (content) {
            content.classList.remove('active');
            });

            // Show content corresponding to clicked tab
            var target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');

            // Log the active tab
            console.log('Active tab:', tab.textContent || tab.innerText);        
        });
    });
});
