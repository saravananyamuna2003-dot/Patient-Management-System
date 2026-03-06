public with sharing class BillingController {

    @AuraEnabled
    public static Billing__c createBilling(
        Id appointmentId,
        Decimal consultationFee,
        Decimal medicineCost,
        String paymentStatus
    ) {
        Billing__c bill = new Billing__c();
        bill.Appointment__c = appointmentId;
        bill.Consultation_Fee__c = consultationFee;
        bill.Medicine_Cost__c = medicineCost;
        bill.Payment_Status__c = paymentStatus;

        insert bill;
        return bill;
    }
}