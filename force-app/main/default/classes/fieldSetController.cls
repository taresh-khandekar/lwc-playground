/**
 * @description Controller to fetch field set information for the Account object.
 * @author Tarehs Khandekar (taresh.khandekar@outlook.com)
 */
public with sharing class fieldSetController {
    /**
     * @description Wrapper class to hold field information for a field set field.
     */
    public class FieldSetFieldInfo {
        @AuraEnabled
        public String fieldPath { get; set; }
        @AuraEnabled
        public String fieldLabel { get; set; }
        @AuraEnabled
        public String fieldType { get; set; }
        @AuraEnabled
        public Boolean required { get; set; }
        @AuraEnabled
        public List<String> picklistValues { get; set; }
        @AuraEnabled
        public Boolean isAccessible { get; set; }
    }

    /**
     * @description Retrieves field information for the 'PersonalInformationFieldSet' field set on the Account object.
     * @return LightningResponse containing field metadata and status.
     */
    @AuraEnabled(cacheable=true)
    public static LightningResponse getFieldSetFields(String objectName, String fieldSetName) {
        System.debug('Fetching field set fields for object: ' + objectName + ', field set: ' + fieldSetName);
        LightningResponse response = new LightningResponse();
        try {
            Schema.SObjectType sObj = Schema.getGlobalDescribe().get(objectName);
            Schema.FieldSet fs = getFieldSet(sObj, fieldSetName);
            if (fs == null) {
                setErrorResponse(response, 'Field set not found on ' + objectName + ' object');
                return response;
            }

            Schema.DescribeSObjectResult describeResult = sObj.getDescribe();
            Map<String, Schema.SObjectField> fieldMap = describeResult.fields.getMap();
            List<FieldSetFieldInfo> fieldList = buildFieldSetFieldInfoList(fs, fieldMap);

            response.isSuccess = true;
            response.returnMessage = 'Field set retrieved successfully';
            response.dataMap.put('fields', fieldList);
        } catch (Exception e) {
            setErrorResponse(response, 'Error: ' + e.getMessage());
        }
        return response;
    }

    /**
     * @description Helper method to get a field set from an SObjectType.
     * @param sObj The SObjectType from which to retrieve the field set.
     * @param fieldSetName The name of the field set to retrieve.
     * @return The Schema.FieldSet object if found, otherwise null.
     */
    private static Schema.FieldSet getFieldSet(Schema.SObjectType sObj, String fieldSetName) {
        if (sObj == null) { return null; }
        Map<String, Schema.FieldSet> fsMap = sObj.getDescribe().fieldSets.getMap();
        if (fsMap == null) { return null; }
        return fsMap.get(fieldSetName);
    }

    /**
     * @description Helper method to build a list of FieldSetFieldInfo from a field set and field map.
     * @param fs The field set containing the fields to process.
     * @param fieldMap The map of field API names to SObjectField tokens.
     * @return List of FieldSetFieldInfo objects representing the fields in the field set.
     */
    private static List<FieldSetFieldInfo> buildFieldSetFieldInfoList(Schema.FieldSet fs, Map<String, Schema.SObjectField> fieldMap) {
        List<FieldSetFieldInfo> fieldList = new List<FieldSetFieldInfo>();
        for (Schema.FieldSetMember fsm : fs.getFields()) {
            System.debug('Field Path: ' + fsm);
            Schema.SObjectField field = fieldMap.get(fsm.getFieldPath());
            if (field != null) {
                fieldList.add(buildFieldSetFieldInfo(fsm, field));
            }
        }
        return fieldList;
    }

    /**
     * @description Helper method to build FieldSetFieldInfo for a single field.
     * @param fsm The FieldSetMember representing the field in the field set.
     * @param field The SObjectField token for the field.
     * @return FieldSetFieldInfo object containing metadata for the field.
     */
    private static FieldSetFieldInfo buildFieldSetFieldInfo(Schema.FieldSetMember fsm, Schema.SObjectField field) {
        Schema.DescribeFieldResult dfr = field.getDescribe();
        FieldSetFieldInfo fieldInfo = new FieldSetFieldInfo();
        fieldInfo.fieldPath = fsm.getFieldPath();
        fieldInfo.fieldLabel = dfr.getLabel();
        fieldInfo.fieldType = String.valueOf(dfr.getType());
        fieldInfo.required = !dfr.isNillable();
        fieldInfo.isAccessible = dfr.isAccessible();
        if (dfr.getType() == Schema.DisplayType.PICKLIST || dfr.getType() == Schema.DisplayType.MULTIPICKLIST) {
            fieldInfo.picklistValues = getActivePicklistValues(dfr);
        }
        return fieldInfo;
    }

    /**
     * @description Helper method to get active picklist values from a field.
     * @param dfr The DescribeFieldResult for the picklist field.
     * @return List of active picklist values.
     */
    private static List<String> getActivePicklistValues(Schema.DescribeFieldResult dfr) {
        List<String> picklistVals = new List<String>();
        for (Schema.PicklistEntry entry : dfr.getPicklistValues()) {
            if (entry.isActive()) {
                picklistVals.add(entry.getValue());
            }
        }
        return picklistVals;
    }

    /**
     * @description Helper method to set error response.
     * @param response The LightningResponse object to update.
     * @param message The error message to set in the response.
     */
    private static void setErrorResponse(LightningResponse response, String message) {
        response.isSuccess = false;
        response.returnMessage = message;
        response.dataMap.put('fields', new List<FieldSetFieldInfo>());
    }
}