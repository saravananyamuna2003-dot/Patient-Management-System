import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getDoctors from '@salesforce/apex/DoctorController.getDoctors';
import getPatients from '@salesforce/apex/AppointmentController.getPatients';
import saveAppointment from '@salesforce/apex/AppointmentController.saveAppointment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class Test extends NavigationMixin(LightningElement) {



     doctors = [];
     patients = [];


     selectedDoctorId;
     selectedDoctor;
     selectedSpec;
     selectedImage;
     selectedExperience;
     selectedShift = '';


     appointmentDate;
     selectedTime = '';
     timeSlots = [];


     phone;
     selectedPatientId; // ✅ IMPORTANT
     showPatient = false;
     isLoading = false;


/*=============  ToPresBill================ */

     navigateToPresBill() {
    // Optional: get appointmentId dynamically
    const appointmentId = this.selectedPatientId; // or whatever ID you want

    this[NavigationMixin.Navigate]({
        type: 'standard__navItemPage',
        attributes: {
            apiName: 'prescription_and_billing' // Lightning App Page developer name
        },
        state: {
            c__appointmentId: appointmentId // optional
        }
    });
}



    /* ================= LOAD DATA ================= */


    connectedCallback() {
        this.loadDoctors();
        this.loadPatients();
    }


    loadDoctors() {
        getDoctors()
            .then(result => {
                this.doctors = result;
            })
            .catch(error => console.error(error));
    }


    loadPatients() {
        getPatients()
            .then(result => {
                this.patients = result;
            })
            .catch(error => console.error(error));
    }


    /* ================= DOCTOR SELECT ================= */


    selectDoctor(event) {

    const docId = event.currentTarget.dataset.id;
    const doc = this.doctors.find(d => d.Id === docId);
    if (!doc) return;

    this.selectedDoctorId = doc.Id;
    this.selectedDoctor = doc.Name;
    this.selectedSpec = doc.Specialization__c;
    this.selectedExperience = doc.Experience_Years__c;
    this.selectedImage = doc.Photo_URL__c;
    this.selectedShift = doc.Shift__c;

    this.showPatient = false;
    this.selectedTime = '';
    this.timeSlots = [];

    if (this.appointmentDate) {
        this.generateTimeSlots();
    }
}


    /* ================= INPUT HANDLERS ================= */


    handlePatientChange(event) {
    this.selectedPatientId = event.target.value;

    const selected = this.patients.find(
        p => p.Id === this.selectedPatientId
    );

    if (selected) {
        this.phone = selected.Phone__c; 
    }
    else {
        this.phone = '';
    }
}

  


showPatientSection() {

    if (!this.selectedDoctorId) {
        this.showToast('Error', 'Please select a doctor', 'error');
        return;
    }

    this.showPatient = true;
}

handleAddPatient() {
    this[NavigationMixin.Navigate]({
        type: 'standard__objectPage',
        attributes: {
            objectApiName: 'patient__c',
            actionName: 'new'
        },
        state: {
            nooverride: '1'
        }
    });
}

   
   /* handlePhone(event) {
        this.phone = event.target.value;
    }*/


handleDateChange(event) {
    this.appointmentDate = event.target.value;

    if (this.selectedDoctorId) {
        this.generateTimeSlots();
    }
}


    handleTimeChange(event) {
        this.selectedTime = event.target.value;
    }






    /* ================= TIME SLOT LOGIC ================= */


    generateTimeSlots() {

    let slots = [];

    if (!this.selectedShift || !this.appointmentDate) {
        this.timeSlots = [];
        return;
    }

    const shift = this.selectedShift.toLowerCase();

    if (shift.includes('morning')) {
        slots = this.createSlots(6, 12);
    }
    else if (shift.includes('afternoon')) {
        slots = this.createSlots(12, 16);
    }
    else if (shift.includes('evening')) {
        slots = this.createSlots(16, 20);
    }
    else if (shift.includes('night')) {
        slots = this.createSlots(20, 24);
    }

    this.timeSlots = slots.map(time => ({
        label: time,
        value: time
    }));
}








//================ create slots =============


createSlots(startHour, endHour) {
    let times = [];


    for (let hour = startHour; hour < endHour; hour++) {


        // full hour
        times.push(this.formatTime(hour, 0));


        // half hour
        times.push(this.formatTime(hour, 30));
    }


    return times;
}


/*=================Time Formatter (Reusable & clean) =====================*/


formatTime(hour24, minute) {
    let hour = hour24 % 24;
    let ampm = hour >= 12 ? 'PM' : 'AM';
    let displayHour =
        hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;


    let min = minute === 0 ? '00' : minute;


    return `${displayHour}:${min} ${ampm}`;
}








    /* ================= SAVE APPOINTMENT ================= */


   confirmAppointment() {

    if (!this.selectedPatientId ||
        !this.selectedDoctorId ||
        !this.appointmentDate ||
        !this.selectedTime) {

        this.showToast(
            'Error',
            'Please fill all required fields',
            'error'
        );
        return;
    }

    this.isLoading = true;

    saveAppointment({
        patientId: this.selectedPatientId,
        doctorId: this.selectedDoctorId,
        appDate: this.appointmentDate,
        appTime: this.selectedTime,
        shift: this.selectedShift
    })
    .then(() => {
        this.showToast(
            'Success',
            'Appointment Booked Successfully',
            'success'
        );

        this.showPatient = false;
        this.selectedTime = '';
    })
    .catch(error => {
        this.showToast(
            'Slot Unavailable',
            error.body?.message || 'Error booking appointment',
            'error'
        );
    })
    .finally(() => {
        this.isLoading = false;
    });
}




    /* ================= ADD DOCTOR ================= */


    openDoctorModal() {
        window.open('/lightning/o/Doctor__c/new', '_blank');
        setTimeout(() => this.loadDoctors(), 5000);
    }


    /* ================= TOAST ================= */


    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
