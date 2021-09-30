public without sharing class ManageFilesController {



    @AuraEnabled
    public static String getFiles(List<Id> recordIds) {
        String result = '';
        String error = '';
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
    } 
    
    @AuraEnabled
    public static String deleteFile(String recordId){
        String result = '';
        String error = '';
        try {
            Database.DeleteResult dr = Database.delete(recordId, false);


                if(dr.isSuccess()) {
                    result = 'Successfully delete record with ID : ' + dr.getId();
                }else {
                    // Operation failed, so get all errors                
                    for(Database.Error err : dr.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        result = err.getStatusCode() + ': ' + err.getMessage() + ': ' + err.getFields();
                    }                    
                }

            return result;
        } catch (Exception e) {
            error = e.getMessage();
            return error;
            //throw new AuraHandledException(e.getMessage());
        }
    }
}
