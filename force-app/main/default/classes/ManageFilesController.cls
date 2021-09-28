public with sharing class ManageFilesController {



    @AuraEnabled
    public static String getFiles(List<Id> recordIds) {
        String result = '';
        String error = '';
        try {
            for(Id fileId : recordIds) {
                System.debug(LoggingLevel.DEBUG, '---> file Id ' + fileId);
            }
            List<ContentVersion> contentVersions = [
                                                        SELECT Id, FileType, Title, FileExtension,
                                                            ContentDocument.CreatedBy.Name, 
                                                            ContentDocument.ContentSize, CreatedDate, 
                                                            ContentDocumentId, ContentDocument.FileType
                                                        FROM ContentVersion
                                                        WHERE Id IN :recordIds
                                                    ];
            result = JSON.serialize(contentVersions);
            return result;
            
        } catch (Exception e) {
            error = e.getMessage();
            return error;
            //throw new AuraHandledException(e.getMessage());
        } 

    }    
}
