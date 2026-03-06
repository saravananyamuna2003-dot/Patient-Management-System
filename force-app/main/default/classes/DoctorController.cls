public with sharing class DoctorController {

    @AuraEnabled(cacheable=true)
    public static List<Doctor__c> getDoctors() {
        return [
            SELECT Id, Name, Specialization__c, Shift__c, Experience_Years__c, Photos_URL__c
            FROM Doctor__c
            ORDER BY CreatedDate DESC
            //WHERE Availability__c = true
        ];
    }
    @AuraEnabled
    public static void savePhotoUrl(Id doctorId, String photoUrl) {

        if (doctorId == null || photoUrl == null) {
            throw new AuraHandledException('Doctor Id or Photo URL missing');
        }

        Doctor__c doc = new Doctor__c(
            Id = doctorId,
            Photos_URL__c = photoUrl
        );

        update doc;
    }
    
    

}