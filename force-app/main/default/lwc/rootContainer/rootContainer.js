import { LightningElement,track } from 'lwc';
import getFormSteps from '@salesforce/apex/RootContainerController.getFormSteps';

export default class RootContainer extends LightningElement {

    @track steps = []; // To hold the fetched steps metadata
    @track currentStep; // Track current step's Order value
    @track currentStepIndex; // Track current step's index in the sorted steps array
    @track componentConstructor; // To hold the dynamically imported component constructor
    stepsLength = 0;
    fieldsJson = {};

    connectedCallback() {
        this.fetchFormSteps();
    }

    // Imperative call to Apex method
    fetchFormSteps() {
        getFormSteps().then(response => {
            if (response && response.isSuccess) {
                this.steps = JSON.parse(JSON.stringify(Object.values(response.dataMap)));
                const firstStep = this.steps[0];
                this.currentStep = firstStep.Sequence;
                this.currentStepIndex = 0; // Start at index 0
                this.stepsLength = this.steps.length;
                this.componentIntializer(firstStep);
            } else {
                // Handle error message
                console.error('Error:', response ? response.returnMessage : 'Unknown error');
            }
        })
        .catch(error => {
            // Handle Apex call error
            console.error('Apex error:', error);
        });
    }

    async renderComponent(componentToRender) {
        const ctor = await import(componentToRender);
        this.componentConstructor = ctor.default;
    }

    // Navigation step handler
    navigationStep(event){
        //Handle form data from child component
        const { selectedStep, formData } = event.detail;
        console.log('Received from child:', selectedStep, 'Form data :',JSON.stringify(formData));
        let numberOfStepsToMove = 0;
        if (selectedStep === 'previous'){
            numberOfStepsToMove = -1;
            this.changeStepNumber(numberOfStepsToMove);
        } else if (selectedStep === 'next'){
            numberOfStepsToMove = 1;
            this.changeStepNumber(numberOfStepsToMove);
        }
        const stepDetails = this.steps.find(step => step.Sequence === this.currentStep);
        this.componentIntializer(stepDetails, );
    }

    componentIntializer(stepDetails){
        let fieldsData = JSON.parse(stepDetails.FieldsToDisplay);
        fieldsData['title'] = stepDetails.Label;
        fieldsData['currentStep'] = this.currentStepIndex;
        fieldsData['totalSteps'] = this.stepsLength;
        console.log('Fields Data for: ', this.currentStepIndex,' -> ', JSON.stringify(fieldsData));
        this.fieldsJson = fieldsData;
        const componentToRender = stepDetails.ComponentName;
        this.renderComponent(`c/${componentToRender}`);
    }

    // Helper to change the step number using array index
    changeStepNumber(direction) {
        const nextIndex = this.currentStepIndex + direction;
        // Check if next index is valid
        if (nextIndex >= 0 && nextIndex < this.steps.length) {
            this.currentStepIndex = nextIndex;
            this.currentStep = this.steps[nextIndex].Sequence;
        }
    }

    saveResult(){
        // Implement form submission logic here
        console.log('Form submitted!');
    }
}