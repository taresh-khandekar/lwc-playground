public with sharing class RootContainerController {
   
    /**
     * Fetches all FormStep__mdt records and returns a LightningResponse.
     * The dataMap will use Form_Label__c as key and a map of field values as value.
     */
    @AuraEnabled(cacheable=true)
    public static LightningResponse getFormSteps() {
        LightningResponse response = new LightningResponse();
        try {
            Map<String, Object> stepsMap = new Map<String, Object>();
            List<FormStep__mdt> steps = [SELECT Id, DeveloperName, MasterLabel,Sequence__c,
                                            ComponentName__c, ObjectAndFields__c,Namespace__c 
                                        FROM FormStep__mdt WHERE Is_Active__c = true
                                        ORDER BY Sequence__c ASC];
            for (FormStep__mdt step : steps) {
                Map<String, Object> stepData = new Map<String, Object>{
                    'Label' => step.MasterLabel,
                    'ComponentName' => step.ComponentName__c,
                    'FieldsToDisplay' => step.ObjectAndFields__c,
                    'Namespace' => step.Namespace__c,
                    'Order' => step.Sequence__c,
                    'Sequence' => step.Sequence__c
                };
                // Use MasterLabel as key, fallback to DeveloperName if blank
                String key = String.isBlank(step.MasterLabel) ? step.DeveloperName : step.MasterLabel;
                stepsMap.put(key, stepData);
            }
            response.dataMap = stepsMap;
            response.isSuccess = true;
        } catch (Exception ex) {
            response.isSuccess = false;
            response.returnMessage = 'Error fetching FormStep__mdt: ' + ex.getMessage();
        }
        return response;
    }
}