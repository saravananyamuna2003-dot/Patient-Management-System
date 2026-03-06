public with sharing class AppointmentController {

    // ================= SAVE APPOINTMENT =================
    @AuraEnabled
    public static void saveAppointment(
       Id patientId,
       Id doctorId,
       Date appDate,
       String appTime,
       String shift
    ) {
        // 1️⃣ Create Patient
       /* patient__c p = new patient__c(
            Name = patientName,
            Phone__c = phone,
            Date_Of_Birth__c = dob
            
        );
        insert p;*/

        // 2️⃣ Create Appointment
        Appointment__c a = new Appointment__c(
        patient__c = patientId,
        Doctor__c = doctorId,
        Appointment_Date__c = appDate,
        Appointment_Time__c = appTime,
        Shift__c = shift,
        Status__c = 'Booked'
    );
    insert a;
}

    // ================= GET PATIENT PICKLIST =================
    @AuraEnabled(cacheable=true)
    public static List<patient__c> getPatients() {
        return [
            SELECT Id, Name
            FROM patient__c
            ORDER BY CreatedDate DESC
        ];
    }
    
    
    //====================== getBookedSlots==================
    
    @AuraEnabled(cacheable=true)
    public static List<Appointment__c> getBookedSlots(Id doctorId, Date selectedDate) {
        return [
            SELECT Id, Appointment_Time__c
            FROM Appointment__c
            WHERE Doctor__c = :doctorId
            AND Appointment_Date__c = :selectedDate
        ];
    }
}