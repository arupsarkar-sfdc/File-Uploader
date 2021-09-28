import { LightningElement, api, track } from 'lwc';
import getFiles from '@salesforce/apex/ManageFilesController.getFiles'


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

export default class ManageFiles extends LightningElement {
    @track _bannerText
    @track _recordIds = []
    @track _objectId
    @track _message; 
    @track columns = columns;
    @track data
    showSpinner = false
    @api usedInCommunity;
    @track _communityName;

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

        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'Preview':
                //this.previewFile(row);
                break;
            case 'Download':
                //this.downloadFile(row);
                break;
            case 'Delete':
                //this.handleDeleteFiles(row);
                break;
            default:
        }

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
                file.CREATED_BY  = file.ContentDocument.CreatedBy.Name;
                file.Size        = this.formatBytes(file.ContentDocument.ContentSize, 2);
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