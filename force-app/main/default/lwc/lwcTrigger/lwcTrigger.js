import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const FIELDS_TO_TRACK= ['Account.Rating','Account.Industry','Account.Type'];

export default class LwcTrigger extends LightningElement {

    @api recordId;
    @track updatedFieldsAPI = [];
    @track newMap = new Map();

    boolTriggerExecuted = false;
    oldMap = new Map();
    FIELDS_API = ['Rating','Industry','Type'];

    @wire(getRecord,{ recordId: '$recordId', fields: FIELDS_TO_TRACK })
    wiredRecord({ error, data }) {
        if (error) {
            console.log('error occured ==>',error);
            this.showNotification('error','Something went wrong. Please try again later.');
        } else if (data) {
            this.generateOldNewMap('new', data);
    
            if(this.oldMap.size === 0){
                this.generateOldNewMap('old', data);
            }
            let oldVal = '';
            let newVal = '';
            this.FIELDS_API.forEach(element => {
                oldVal = this.oldMap.get('old_'+element);
                newVal = this.newMap.get('new_'+element);
                if(!this.boolTriggerExecuted && oldVal 
                    && oldVal !== this.newMap.get('new_'+element)){
                    this.updatedFieldsAPI.push(element);
                    this.boolTriggerExecuted = true;
                }
            });
            if(this.boolTriggerExecuted){
                this.boolTriggerExecuted = false;
                console.log('New Value ==>',newVal);
                console.log('Old Value ==>',oldVal);
                this.showNotification('info','Field changed: ' + this.updatedFieldsAPI);
            }
        }
    }

    generateOldNewMap(context, data){
        console.log('context ==>',context);
        console.log('data ==>',data);
        let InnovationPortfolio = data.fields;
        console.log('InnovationPortfolio ==>',InnovationPortfolio);
        this.FIELDS_API.forEach(element => {
            let displayValue = InnovationPortfolio[element].displayValue;
            let val = displayValue || InnovationPortfolio[element].value;

            this[`${context}Map`].set(`${context}_${element}`, val);
        });
    }

    showNotification(eventType, message) {
        const toastEvent = new ShowToastEvent({
            title: eventType,
            message: message,
            variant: eventType,
            mode: 'sticky'
        });
        this.dispatchEvent(toastEvent);
        this.oldMap = null;
        this.updatedFieldsAPI = [];
    }
}