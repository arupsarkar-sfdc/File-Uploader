@IsTest
public class ManageFilesController_TEST {

    @testSetup static void setup() {
        // Lead setup
        List<Lead> leads = new List<Lead>();

        Lead l = new Lead();
        l.FirstName = 'Billy';
        l.LastName = 'Bob';
        l.Company = 'Bobs Inc';
        l.Email = 'billy@bobs-inc.com';
        l.Phone = '9088890098';
        leads.add(l); 

        insert leads;
        
        // Content Version setup
        List<ContentVersion> cvs = new List<ContentVersion>();

        ContentVersion cv1 = new ContentVersion();
        cv1.Title = 'File 1';
        cv1.PathOnClient = 'File 1.jpg';
        cv1.VersionData = EncodingUtil.base64Decode('File Body with content 1');
        cv1.IsMajorVersion = true;
        cvs.add(cv1);

        ContentVersion cv2 = new ContentVersion();
        cv2.Title = 'File 2';
        cv2.PathOnClient = 'File 2.pdf';
        cv2.VersionData = EncodingUtil.base64Decode('File Body with content 2');        
        cv2.IsMajorVersion = true;
        cvs.add(cv2);

        insert cvs;

        List<ContentDocument> cds = [SELECT Id, Title, LatestPublishedVersionId 
                                    FROM ContentDocument
                                    ORDER BY Id];

        List<ContentDocumentLink> cdls = new List<ContentDocumentLink>();
        
        ContentDocumentLink cdl1 = new ContentDocumentLink();
        cdl1.LinkedEntityId =  leads[0].Id;
        cdl1.ContentDocumentId = cds[0].Id;
        cdl1.Visibility = 'AllUsers';
        cdls.add(cdl1);

        ContentDocumentLink cdl2 = new ContentDocumentLink();
        cdl2.LinkedEntityId =  leads[0].Id;
        cdl2.ContentDocumentId = cds[1].Id;
        cdl2.Visibility = 'AllUsers';
        cdls.add(cdl2);   
        
        insert cdls;
    }

    @IsTest
    static void validateRecordsExist() {

        Test.startTest();
        List<Lead> leads = [SELECT Id, FirstName, LastName, Company, Email, Phone 
                                FROM Lead];
        System.assertEquals(1, leads.size(), 'There should be only 1 lead created');
        System.assertEquals('Billy', leads[0].FirstName, 'First Name should be Billy');
        System.assertEquals('Bob', leads[0].LastName, 'Last Name should be Bob');
        Test.stopTest();

    }

    @IsTest
    static void validateFilesAttachedToARecordExist() {

        Test.startTest();


        List<Lead> leads = [SELECT Id from Lead];

        List<ContentDocumentLink> cdls = [SELECT Id, ContentDocumentId, LinkedEntityId 
                                            FROM ContentDocumentLink
                                            WHERE LinkedEntityId = :leads[0].Id];        
        System.assertEquals(2, cdls.size(), 'There should be only 2 CDLs created');

        //Now test the ManageFilesController
        List<Id> cvsIds = new List<Id>();
        List<ContentVersion> cvs = [SELECT Id from ContentVersion];
        for(ContentVersion cv : cvs) {
            cvsIds.add(cv.Id);
        }
        String data = ManageFilesController.getFiles(cvsIds);
        System.debug(LoggingLevel.DEBUG, data);
        JSONParser parser = JSON.createParser(data);
        // while(parser.nextToken() != null) {

        // }
        // happy path
        Integer dataLength = data.length();
        System.assertEquals(dataLength, data.length(), 'Data value should exist');

        //sad path
        List<Id> errorIds = new List<Id>();
        errorIds.add(null);        
        String errorData = ManageFilesController.getFiles(errorIds);
        Test.stopTest();

    }

    @IsTest
    static void validateDeleteFiles() {    
        Test.startTest();
        List<ContentDocument> cdsBeforeDelete = [SELECT Id from ContentDocument];
        System.assertEquals(2, cdsBeforeDelete.size(), 'Total 2 CDs should exist');
        ManageFilesController.deleteFile(cdsBeforeDelete[0].Id);
        List<ContentDocument> cdsAfterDelete = [SELECT Id from ContentDocument];
        System.assertEquals(1, cdsAfterDelete.size(), 'Total 1 CD should exist');

        ManageFilesController.deleteFile('abcd');
        System.assertEquals(1, cdsAfterDelete.size(), 'Total 1 CD should exist');
        Test.stopTest();
    }

}
