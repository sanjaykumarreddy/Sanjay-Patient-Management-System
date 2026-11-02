const API = "/patients";

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
    }

    return data;
}

function showMessage(message, isError = false) {
    const element = document.getElementById("message");

    if (element) {
        element.textContent = message;
        element.style.color = isError ? "#c62828" : "#18733b";
    }
}

function createPatientOption(patient) {
    const option = document.createElement("option");

    option.value = patient.patient_id;
    option.textContent =
        `${patient.patient_id} - ${patient.patient_name}`;

    return option;
}

// LOAD PATIENT DROPDOWNS
async function loadPatientDropdown(elementId) {
    const select = document.getElementById(elementId);

    if (!select) return;

    try {
        const patients = await request(API);

        select.replaceChildren(
            new Option("Select a patient", "")
        );

        patients.forEach(patient => {
            select.appendChild(createPatientOption(patient));
        });
    } catch (error) {
        select.replaceChildren(
            new Option("Unable to load patients", "")
        );

        showMessage(error.message, true);
    }
}

// CREATE PATIENT
const insertForm = document.getElementById("insertForm");

if (insertForm) {
    insertForm.addEventListener("submit", async event => {
        event.preventDefault();

        const patient = Object.fromEntries(
            new FormData(insertForm).entries()
        );

        patient.age = Number(patient.age);

        try {
            const result = await request(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patient)
            });

            showMessage(
                `${result.message}. Patient ID: ${result.patient_id}`
            );

            insertForm.reset();
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

// READ ALL PATIENTS
async function loadPatients() {
    const tableBody = document.getElementById("patientTableBody");

    if (!tableBody) return;

    try {
        const patients = await request(API);
        tableBody.replaceChildren();

        if (patients.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();

            cell.colSpan = 7;
            cell.textContent = "No patient records found.";

            return;
        }

        patients.forEach(patient => {
            const row = tableBody.insertRow();

            [
                patient.patient_id,
                patient.patient_name,
                patient.email,
                patient.phone_number,
                patient.gender,
                patient.age,
                patient.problem
            ].forEach(value => {
                const cell = row.insertCell();

                // textContent safely displays database values as text.
                cell.textContent = value ?? "";
            });
        });
    } catch (error) {
        showMessage(error.message, true);
    }
}

// READ ONE PATIENT
const viewButton = document.getElementById("viewPatient");

if (viewButton) {
    loadPatientDropdown("patientSelect");

    viewButton.addEventListener("click", async () => {
        const id = document.getElementById("patientSelect").value;
        const details = document.getElementById("patientDetails");

        details.replaceChildren();

        if (!id) {
            showMessage("Please select a patient.", true);
            return;
        }

        try {
            const patient = await request(`${API}/${id}`);

            const heading = document.createElement("h3");
            heading.textContent = "Patient Details";

            details.appendChild(heading);

            const fields = [
                ["Patient ID", patient.patient_id],
                ["Patient Name", patient.patient_name],
                ["Email", patient.email],
                ["Phone Number", patient.phone_number],
                ["Gender", patient.gender],
                ["Age", patient.age],
                ["Problem", patient.problem]
            ];

            fields.forEach(([label, value]) => {
                const paragraph = document.createElement("p");

                paragraph.textContent = `${label}: ${value ?? ""}`;

                details.appendChild(paragraph);
            });

            showMessage("");
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

// UPDATE PATIENT
const updateSelect = document.getElementById("updatePatientSelect");
const updateForm = document.getElementById("updateForm");

if (updateSelect && updateForm) {
    loadPatientDropdown("updatePatientSelect");

    updateSelect.addEventListener("change", async () => {
        updateForm.hidden = true;

        const id = updateSelect.value;

        if (!id) return;

        try {
            const patient = await request(`${API}/${id}`);

            updateForm.elements.patient_name.value =
                patient.patient_name;

            updateForm.elements.email.value = patient.email;
            updateForm.elements.phone_number.value =
                patient.phone_number;

            updateForm.elements.gender.value = patient.gender;
            updateForm.elements.age.value = patient.age;
            updateForm.elements.problem.value = patient.problem;

            updateForm.hidden = false;

            showMessage("");
        } catch (error) {
            showMessage(error.message, true);
        }
    });

    updateForm.addEventListener("submit", async event => {
        event.preventDefault();

        const id = updateSelect.value;

        if (!id) {
            showMessage("Please select a patient.", true);
            return;
        }

        const patient = Object.fromEntries(
            new FormData(updateForm).entries()
        );

        patient.age = Number(patient.age);

        try {
            const result = await request(`${API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patient)
            });

            showMessage(result.message);

            await loadPatientDropdown("updatePatientSelect");

            updateSelect.value = id;
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

// DELETE PATIENT
const deleteButton = document.getElementById("deletePatientButton");

if (deleteButton) {
    loadPatientDropdown("deletePatientSelect");

    deleteButton.addEventListener("click", async () => {
        const select = document.getElementById("deletePatientSelect");
        const id = select.value;

        if (!id) {
            showMessage("Please select a patient.", true);
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete this patient record?"
        );

        if (!confirmed) return;

        try {
            const result = await request(`${API}/${id}`, {
                method: "DELETE"
            });

            showMessage(result.message);

            await loadPatientDropdown("deletePatientSelect");
        } catch (error) {
            showMessage(error.message, true);
        }
    });
}

// RUN THE TABLE LOADER ONLY ON THE ALL-PATIENTS PAGE
loadPatients();