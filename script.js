
const connToken = "YOUR_CONNECTION_TOKEN";

const jpdbBaseURL = "https://api.login2explore.com:5577";
const jpdbIML = "/api/iml";
const jpdbIRL = "/api/irl";

const stuDBName = "SCHOOL-DB";
const stuRelationName = "STUDENT-TABLE";

const rollNo = $("#rollNo");
const fullName = $("#fullName");
const studentClass = $("#studentClass");
const birthDate = $("#birthDate");
const address = $("#address");
const enrollmentDate = $("#enrollmentDate");

const saveBtn = $("#saveBtn");
const updateBtn = $("#updateBtn");
const resetBtn = $("#resetBtn");

let currentMode = "";
let recordNumber = null;

$(document).ready(function () {
    resetForm();

    rollNo.on("change", checkRollNumber);
    saveBtn.on("click", saveStudent);
    updateBtn.on("click", updateStudent);
    resetBtn.on("click", resetForm);
});

function enableStudentFields() {
    fullName.prop("disabled", false);
    studentClass.prop("disabled", false);
    birthDate.prop("disabled", false);
    address.prop("disabled", false);
    enrollmentDate.prop("disabled", false);
}

function disableStudentFields() {
    fullName.prop("disabled", true);
    studentClass.prop("disabled", true);
    birthDate.prop("disabled", true);
    address.prop("disabled", true);
    enrollmentDate.prop("disabled", true);
}

function resetForm() {
    $("#studentForm")[0].reset();

    rollNo.prop("disabled", false);
    disableStudentFields();

    saveBtn.prop("disabled", true);
    updateBtn.prop("disabled", true);
    resetBtn.prop("disabled", true);

    currentMode = "";
    recordNumber = null;

    rollNo.focus();
}

function checkRollNumber() {
    const value = rollNo.val().trim();

    if (value === "") {
        alert("Please enter Roll Number");
        rollNo.focus();
        return;
    }

    const studentKey = {
        "Roll-No": value
    };

    const getRequest = createGET_BY_KEYRequest(
        connToken,
        stuDBName,
        stuRelationName,
        JSON.stringify(studentKey)
    );

    jQuery.ajaxSetup({ async: false });

    const response = executeCommandAtGivenBaseUrl(
        getRequest,
        jpdbBaseURL,
        jpdbIRL
    );

    jQuery.ajaxSetup({ async: true });

    if (response.status === 200) {
        const result = JSON.parse(response.data);

        recordNumber = result.rec_no;
        const student = result.record;

        fullName.val(student["Full-Name"]);
        studentClass.val(student["Class"]);
        birthDate.val(student["Birth-Date"]);
        address.val(student["Address"]);
        enrollmentDate.val(student["Enrollment-Date"]);

        currentMode = "EXISTING";

        rollNo.prop("disabled", true);
        enableStudentFields();

        updateBtn.prop("disabled", false);
        resetBtn.prop("disabled", false);

        fullName.focus();

    } else if (response.status === 400) {
        currentMode = "NEW";

        rollNo.prop("disabled", true);
        enableStudentFields();

        saveBtn.prop("disabled", false);
        resetBtn.prop("disabled", false);

        fullName.focus();

    } else {
        alert("Database error: " + response.message);
    }
}

function validateForm() {
    const fields = [
        { element: fullName, message: "Please enter Full Name" },
        { element: studentClass, message: "Please enter Class" },
        { element: birthDate, message: "Please enter Birth Date" },
        { element: address, message: "Please enter Address" },
        { element: enrollmentDate, message: "Please enter Enrollment Date" }
    ];

    for (const field of fields) {
        if (field.element.val().trim() === "") {
            alert(field.message);
            field.element.focus();
            return false;
        }
    }

    return true;
}

function getStudentData() {
    return JSON.stringify({
        "Roll-No": rollNo.val().trim(),
        "Full-Name": fullName.val().trim(),
        "Class": studentClass.val().trim(),
        "Birth-Date": birthDate.val(),
        "Address": address.val().trim(),
        "Enrollment-Date": enrollmentDate.val()
    });
}

function saveStudent() {
    if (currentMode !== "NEW" || !validateForm()) {
        return;
    }

    const request = createPUTRequest(
        connToken,
        getStudentData(),
        stuDBName,
        stuRelationName
    );

    jQuery.ajaxSetup({ async: false });

    const response = executeCommandAtGivenBaseUrl(
        request,
        jpdbBaseURL,
        jpdbIML
    );

    jQuery.ajaxSetup({ async: true });

    if (response.status === 200) {
        alert("Student saved successfully!");
        resetForm();
    } else {
        alert("Save failed: " + response.message);
    }
}


function updateStudent() {
    if (currentMode !== "EXISTING" || !validateForm()) {
        return;
    }

    const updatedData = JSON.stringify({
        "Full-Name": fullName.val().trim(),
        "Class": studentClass.val().trim(),
        "Birth-Date": birthDate.val(),
        "Address": address.val().trim(),
        "Enrollment-Date": enrollmentDate.val()
    });

    const updateRequest = createUPDATERecordRequest(
        connToken,
        updatedData,
        stuDBName,
        stuRelationName,
        recordNumber
    );

    jQuery.ajaxSetup({ async: false });

    const response = executeCommandAtGivenBaseUrl(
        updateRequest,
        jpdbBaseURL,
        jpdbIML
    );

    jQuery.ajaxSetup({ async: true });

    if (response.status === 200) {
        alert("Student updated successfully!");
        resetForm();
    } else {
        alert("Update failed: " + response.message);
    }
}
