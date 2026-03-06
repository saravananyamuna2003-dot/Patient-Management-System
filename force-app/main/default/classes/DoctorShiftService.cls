public class DoctorShiftService {

    @AuraEnabled(cacheable=true)
    public static List<String> getTimeSlots(Id doctorId) {

        Doctor__c doc = [
            SELECT Shift__c, Availability__c
            FROM Doctor__c
            WHERE Id = :doctorId
        ];

        List<String> slots = new List<String>();

        if(!doc.Availability__c) return slots;

        if(doc.Shift__c == 'Morning') {
            slots.addAll(new List<String>{
                '06:00','07:00','08:00','09:00','10:00','11:00'
            });
        }
        else if(doc.Shift__c == 'Afternoon') {
            slots.addAll(new List<String>{
                '13:00','14:00','15:00','16:00','17:00','18:00'
            });
        }
        else if(doc.Shift__c == 'Evening') {
            slots.addAll(new List<String>{
                '19:00','20:00','21:00','22:00','23:00','00:00'
            });
        }
        else if(doc.Shift__c == 'Night') {
            slots.addAll(new List<String>{
                '01:00','02:00','03:00','04:00','05:00'
            });
        }

        return slots;
    }
}