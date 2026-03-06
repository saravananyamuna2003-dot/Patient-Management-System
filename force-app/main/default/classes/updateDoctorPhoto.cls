public class updateDoctorPhoto {
    @AuraEnabled
public static String updateDoctorPhoto(Id doctorId, Id contentVersionId) {

    if (doctorId == null || contentVersionId == null) {
        throw new AuraHandledException('Missing doctorId or contentVersionId');
    }

    // 1️⃣ Get ContentDocumentId directly
    ContentVersion cv = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :contentVersionId
        LIMIT 1
    ];

    // 2️⃣ Create relative download URL (BEST PRACTICE)
    String photoUrl =
        '/sfc/servlet.shepherd/document/download/' +
        cv.ContentDocumentId;

    // 3️⃣ Update Doctor record
    Doctor__c doc = new Doctor__c(
        Id = doctorId,
        Photos_URL__c = photoUrl
    );
    update doc;

    // 4️⃣ Return URL to LWC
    return photoUrl;
}


}