public with sharing class AppointmentSearchController {

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getAppointments() {

        List<Map<String, Object>> result = new List<Map<String, Object>>();

        for (Appointment__c a : [
            SELECT Id, Name, Appointment_Date__c,
                   Patient__r.Name,
                   Doctor__r.Name
            FROM Appointment__c
            ORDER BY Appointment_Date__c DESC
        ]) {
            result.add(new Map<String, Object>{
                'Id' => a.Id,
                'Name' => a.Name,
                'Appointment_Date__c' => a.Appointment_Date__c,
                'PatientName' => a.Patient__r.Name,
                'DoctorName' => a.Doctor__r.Name
            });
        }
        return result;
    }
}