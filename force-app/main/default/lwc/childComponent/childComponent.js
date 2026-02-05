import { LightningElement, track, api } from 'lwc';
import getFieldSetFields from '@salesforce/apex/fieldSetController.getFieldSetFields';

export default class ChildComponent extends LightningElement {
    @track fields = [];
    @track isLoading = true;
    @track errorMessage = null;
    formData = {};
    @api objectName;
    @api fieldSetName;
    @api title;
    @api currentStep;
    @api totalSteps;

    isRendered = false;
    
    renderedCallback() {
        console.log('Rendered callback executed, fetching fields for', this.objectName, this.fieldSetName);
        if(!this.isRendered){
            this.fetchFieldSetFields();
        }
    }

    // Imperative call to Apex method
    fetchFieldSetFields() {
        this.isLoading = true;
        this.errorMessage = null;
        console.log(' objectName->', this.objectName, ' fieldSetName->', this.fieldSetName, ' title->', this.title, ' currentStep->', this.currentStep, ' totalSteps->', this.totalSteps);
        
        getFieldSetFields({objectName: this.objectName, fieldSetName: this.fieldSetName})
            .then(response => {
                if (response && response.isSuccess) {
                    const fieldsList = response.dataMap.fields || [];
                    this.fields = fieldsList.map(field => {
                        const normalizedType = field.fieldType.toLowerCase();
                        // Convert picklist values to label-value pairs
                        let picklistOptions = [];
                        if ((normalizedType === 'picklist' || normalizedType === 'multipicklist') && field.picklistValues) {
                            picklistOptions = field.picklistValues.map(val => ({
                                label: val,
                                value: val
                            }));
                        }
                        
                        // Generate placeholder text based on field type and label
                        let placeholder = '';
                        if (['string', 'textarea', 'richtextarea'].includes(normalizedType)) {
                            placeholder = `Enter ${field.fieldLabel}`;
                        } else if (['integer', 'double', 'currency', 'percent'].includes(normalizedType)) {
                            placeholder = `Enter ${field.fieldLabel}`;
                        }
                        
                        return {
                            ...field,
                            fieldType: normalizedType,
                            picklistValues: picklistOptions,
                            placeholder: placeholder,
                            // Add type flags to each field
                            typeFlags: {
                                isString: normalizedType === 'string',
                                isTextarea: normalizedType === 'textarea',
                                isRichTextarea: normalizedType === 'richtextarea',
                                isInteger: normalizedType === 'integer',
                                isCurrency: normalizedType === 'currency',
                                isDouble: normalizedType === 'double',
                                isPercent: normalizedType === 'percent',
                                isDate: normalizedType === 'date',
                                isDatetime: normalizedType === 'datetime',
                                isPicklist: normalizedType === 'picklist',
                                isMultiPicklist: normalizedType === 'multipicklist',
                                isBoolean: normalizedType === 'boolean',
                                isUrl: normalizedType === 'url',
                                isEmail: normalizedType === 'email',
                                isPhone: normalizedType === 'phone'
                            }
                        };
                    });

                   this.isRendered = true;
                    console.log('Field Set Fields:', this.fields);
                } else {
                    this.errorMessage = response ? response.returnMessage : 'Unknown error occurred';
                    console.error('Error:', this.errorMessage);
                }
            })
            .catch(error => {
                this.errorMessage = 'Apex error: ' + (error.body?.message || error.message || 'Unknown error');
                console.error('Apex error:', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Handle field value changes
    handleFieldChange(event) {
        const fieldPath = event.target.dataset.fieldPath;
        const value = event.target.value;
        this.formData[fieldPath] = value;
        console.log('Form Data Updated:', JSON.stringify(this.formData));
    }

    getData() {
        return this.formData;
    }

    navigationStep(event){
        const selectedStep = event.target.dataset.step;
        console.log('Navigation Step Clicked:', selectedStep);
        //Use Lightning Message Service to send data to parent component
        const currentPageData = {selectedStep: selectedStep, formData: this.getData()};
        console.log('currentPageData->', JSON.stringify(currentPageData));
        const formDataEvent = new CustomEvent('navclick', {
            detail: currentPageData
        });
        this.dispatchEvent(formDataEvent);
        this.isRendered = false;
    }

    get isFirstStep(){
        return this.currentStep === 0;
    }

    get isLastStep(){
        return this.currentStep === this.totalSteps - 1;
    }
}