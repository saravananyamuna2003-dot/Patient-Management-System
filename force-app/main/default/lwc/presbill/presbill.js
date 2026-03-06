import { LightningElement, wire, track } from 'lwc';
import getAppointments from '@salesforce/apex/BillingController.getAppointments';
import saveBilling from '@salesforce/apex/BillingController.saveBilling';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BillingPage extends LightningElement {

    @track appointmentOptions = [];
    @track appointmentDetails = { patient: '', doctor: '', date: '' };
    appointments = [];

    selectedAppointment;
    consultationFee = 500;
    medicineCost = 0;
    discount = 0;
    tax = 0;
    totalAmount = 500;

    paymentMode;
    paymentStatus;

    prescriptions = [{ id: 1, medicine: '', dosage: '', amount: 0 }];
    prescriptionCounter = 1;

    paymentModeOptions = [
        { label: 'Cash', value: 'Cash' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Card', value: 'Card' },
        { label: 'Net Banking', value: 'Net Banking' }
    ];

    paymentStatusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Partially Paid', value: 'Partially Paid' },
        { label: 'Refunded', value: 'Refunded' }
    ];

    // Load all upcoming appointments
    @wire(getAppointments)
    wiredAppointments({ error, data }) {
        if (data) {
            this.appointments = data;
            this.appointmentOptions = data.map(app => ({
                label: `${app.Name} - ${app.Patient__r?.Name || 'No Patient Assigned'}`,
                value: app.Id
            }));
        } else if (error) {
            console.error(error);
        }
    }

    // When user selects an appointment
    handleAppointmentChange(event) {
        this.selectedAppointment = event.detail.value;

        const selected = this.appointments.find(a => a.Id === this.selectedAppointment);
        if (!selected) return;

        // Show patient, doctor, and date in UI
        this.appointmentDetails = {
            patient: selected.Patient__r?.Name || '',
            doctor: selected.Doctor__r?.Name || '',
            date: selected.Appointment_Date__c
        };
    }

    // Prescription handling
    addPrescription() {
        this.prescriptionCounter++;
        this.prescriptions = [
            ...this.prescriptions,
            { id: this.prescriptionCounter, medicine: '', dosage: '', amount: 0 }
        ];
    }

    handlePrescriptionChange(event) {
        const index = event.target.dataset.index;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.prescriptions[index][field] = field === 'amount' ? Number(value) : value;
        this.prescriptions = [...this.prescriptions];
        this.calculatePrescriptionTotal();
    }

    removePrescription(event) {
        const index = event.target.dataset.index;
        this.prescriptions.splice(index, 1);
        this.prescriptions = [...this.prescriptions];
        this.calculatePrescriptionTotal();
    }

    calculatePrescriptionTotal() {
        let total = this.prescriptions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        this.medicineCost = total;
        this.calculateTotal();
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        if (field === 'paymentMode' || field === 'paymentStatus') {
            this[field] = event.detail.value;
        } else {
            this[field] = Number(event.detail.value);
            this.calculateTotal();
        }
    }

    calculateTotal() {
        const baseAmount = this.consultationFee + this.medicineCost;
        const discountAmount = baseAmount * (this.discount / 100);
        const subtotalAfterDiscount = baseAmount - discountAmount;
        const taxAmount = subtotalAfterDiscount * (this.tax / 100);
        this.totalAmount = subtotalAfterDiscount + taxAmount;
    }

    handleSave() {
        // Validate required fields
        if (!this.selectedAppointment || !this.paymentMode || !this.prescriptions?.length) {
            const missing = [
                !this.selectedAppointment && 'Appointment',
                !this.paymentMode && 'Payment Mode',
                !this.prescriptions?.length && 'Prescriptions'
            ].filter(Boolean).join(', ');

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: `Please fill all required fields: ${missing}`,
                    variant: 'error'
                })
            );
            return;
        }

        const selected = this.appointments.find(a => a.Id === this.selectedAppointment);

        // Block save if appointment has no patient
        if (!selected?.Patient__c) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Selected appointment has no patient assigned. Cannot create billing.',
                    variant: 'error'
                })
            );
            return;
        }

        // Prepare billing record
        const billingRecord = {
            Appointment__c: this.selectedAppointment,
            Patient__c: selected.Patient__c,
            Consultation_Fee__c: this.consultationFee,
            Medicine_Cost__c: this.medicineCost,
            Discount__c: this.discount,
            Tax__c: this.tax,
            Payment_Mode__c: this.paymentMode,
            Payment_Status__c: this.paymentStatus,
            Billing_Date__c: new Date().toISOString().split('T')[0]
        };

        // Prepare prescription records
        const prescriptionRecords = this.prescriptions.map(item => ({
            Medicine__c: item.medicine,
            Dosage__c: item.dosage,
            Amount__c: item.amount
        }));

        // Save billing and prescriptions
        saveBilling({ bill: billingRecord, prescriptions: prescriptionRecords })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Billing & Prescriptions Saved Successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error?.body?.message || 'Error saving billing',
                        variant: 'error'
                    })
                );
            });
    }

    handlePDF() {
        alert('PDF generation next step 🔥');
    }
}