import { LightningElement, api, track } from 'lwc';
import getFiles from '@salesforce/apex/ManageFilesController.getFiles'
import deleteFile from '@salesforce/apex/ManageFilesController.deleteFile'
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

const columns = [
    { label: 'Title',       fieldName: 'Title', wrapText : true,
        cellAttributes: { 
            iconName: { fieldName: 'icon' }, iconPosition: 'left' 
        }
    },
    { label: 'Created By',  fieldName: 'CREATED_BY',
        cellAttributes: { 
            iconName: 'standard:user', iconPosition: 'left' 
        }
    },
    { label: 'File Size',   fieldName: 'Size' },
    { label: 'Preview', type:  'button', typeAttributes: { 
            label: 'Preview',  name: 'Preview',  variant: 'brand-outline',
            iconName: 'utility:preview', iconPosition: 'right'
        } 
    },
    { label: 'Download', type:  'button', typeAttributes: { 
            label: 'Download', name: 'Download', variant: 'brand', iconName: 'action:download', 
            iconPosition: 'right' 
        } 
    },
    { label: 'Delete', type:  'button', typeAttributes: { 
            label: 'Delete',   name: 'Delete',   variant: 'destructive',iconName: 'standard:record_delete', 
            iconPosition: 'right' 
        } 
    } 
];

export default class ManageFiles extends NavigationMixin(LightningElement) {
    @track _bannerText
    @track _recordIds = []
    @track _objectId
    @track _message; 
    @track columns = columns;
    @track data
    showSpinner = false
    @api usedInCommunity;
    @track _communityName;
    dbMessage

    @api
    get communityName() {
        return this._communityName
    }
    set communityName(val) {
        this._communityName = val
    }

    @api
    get objectId() {
        return this._objectId
    }
    set objectId(val) {
        this._objectId = val
    }

    @api 
    get recordIds() {
        return this._recordIds
    }
    set recordIds(recordIds = []) {
        this._recordIds = [...recordIds]
    }

    @api
    get bannerText() {
        return this._bannerText
    }
    set bannerText(val) {
        this._bannerText = val
    }

    @api 
    get message() {
        return this._message
    }
    set message(val) {
        this._message = val
    }

    bannerText = 'Manage Files'
    constructor() {
        super()
        console.log('Banner Text', this._bannerText)
        console.log('recordIds', this._recordIds)
        console.log('objectId', this._objectId)
        console.log('message', this._message)
    }

    connectedCallback() {
        this.getFilesController()
    }

    getBaseUrl() {
        let baseUrl = ''
        if(this.usedInCommunity) {
            baseUrl = 'https://'+location.host+'/'+this._communityName+'/';
        } else {
            baseUrl = 'https://'+location.host+'/';
        }
        return baseUrl;
    }
    

    handleRowAction(event){
        event.preventDefault()
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log('---> handle row action event - ', event)
        console.log('---> handle row action name - ', actionName)
        console.log('---> handle row action row - ', row)
        switch (actionName) {
            case 'Preview':
                this.previewFile(row);
                break;
            case 'Download':
                this.downloadFile(row);
                break;
            case 'Delete':
                this.deleteFile(row)
                break;
            default:
        }

    }  

    previewFile(row) {

        if(this._communityName) {
            showToast() {
                const event = new ShowToastEvent({
                    title: 'Preview File - Help',
                    message: 'If you cannot preview this file, check with the system administrator.',
                });
                this.dispatchEvent(event);
            }
            return
        }

        console.log('---> preview file ', JSON.stringify(row))
        console.log('---> used in community ', this.usedInCommunity)
        let currentRow = JSON.parse(JSON.stringify(row))
        console.log('---> preview content document id ', currentRow.ContentDocumentId)   
        console.log('---> preview content file url ', currentRow.fileUrl)                        
        if(!this.usedInCommunity){
            this[NavigationMixin.Navigate]({
                type: 'standard__namedPage',
                attributes: {
                    pageName: 'filePreview'
                },
                state : {
                    selectedRecordId: currentRow.ContentDocumentId
                }
            });
        } else if(this.usedInCommunity){
            
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: currentRow.fileUrl
                }
            }, false );
        }
    }

    downloadFile(row) {

        if(this._communityName) {
            showToast() {
                const event = new ShowToastEvent({
                    title: 'Download File - Help',
                    message: 'If you cannot download this file, check with the system administrator.',
                });
                this.dispatchEvent(event);
            }
            return
        }

        console.log('---> download file ', JSON.stringify(row))
        let currentRow = JSON.parse(JSON.stringify(row))
        console.log('---> download content download url - ', currentRow.downloadUrl)        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: currentRow.downloadUrl
            }
        }, false);
    }
    
    deleteFile(row) {
        console.log('---> delete file ', JSON.stringify(row))
        let currentRow = JSON.parse(JSON.stringify(row))
        console.log('---> delete content document id ', currentRow.ContentDocumentId)
        this.showSpinner = true
        deleteFile({
            recordId: currentRow.ContentDocumentId
        })
        .then(result => {
            this.data  = this.data.filter(item => {
                return item.ContentDocumentId !== currentRow.ContentDocumentId ;
            });
            this.dbMessage = result
        })
        .catch(error => {
            console.error('**** error **** \n ',error)
        })
        .finally(() => {
            this.showSpinner = false
        })
    }

    formatBytes(bytes,decimals) {
        if(bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }    

    getFilesController() {
        this.showSpinner = true
        getFiles({
            recordIds: this._recordIds
        })
        .then( result => {
            console.log('**** result **** \n ',result)
            let parsedData = JSON.parse(result)
            let stringifiedData = JSON.stringify(parsedData)
            let finalData = JSON.parse(stringifiedData)
            let baseUrl = this.getBaseUrl()

            finalData.forEach(file => {
                file.downloadUrl = baseUrl+'sfc/servlet.shepherd/document/download/'+file.ContentDocumentId;
                file.fileUrl     = baseUrl+'sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+file.Id;
                file.CREATED_BY  = file.ContentDocument.CreatedBy.Name;
                file.Size        = this.formatBytes(file.ContentDocument.ContentSize, 2);
                file.icon = 'doctype:attachment'
            })

            this.data = finalData

        })
        .catch(error => {
            console.error('**** error **** \n ',error)            
        })
        .finally(() => {
            this.showSpinner = false
        })
    }

}