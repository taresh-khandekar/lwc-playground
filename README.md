[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ktaresh)

# **Hi, welcome to my git repo.**


## Here I'll be consolidate my learnings and create a re-usable code base.
## If you find anything useful please feel free to use. Follow for more updates.


## LwcTrigger
- Since we can't intercept record trasaction in between to collect response or display UI using OOTB record details page.
- This is simple component based on getRecord wire adapter.
- It continueously tracks changes in mentioned fields on record detail page.
- ***LWC UI will be rendered post completion of transaction process***

**Use Case**
- Collect user responce right after record update from standard details page.
- Show some UI once record update is processed.

---

## Dynamic LWC form Rendering from metadata 

### Components & Metadata

- **Apex Classes:**
	- `RootContainerController`: Fetches FormStep__mdt records to drive step-based forms.
	- `fieldSetController`: Retrieves field set information for any object (not just Account).
	- `LightningResponse`: Standard response wrapper for Apex-LWC/Aura communication.

- **LWC Components:**
	- `rootContainer`: Hosts the multi-step form, fetches step metadata, and dynamically loads child components.
	- `childComponent`: Renders fields dynamically based on field set metadata, handles form input and validation.

- **Custom Metadata:**
	- `FormStep__mdt`: Defines each form step, its sequence, component, and fields to display.
		- Example steps: Address Details, Contact Details, Personal Information.
	- Metadata files for new fields and components are included under `objects/FormStep__mdt/fields` and `customMetadata/`.

### Use Case
- Render LWC components as defined in metadata, maintaining step sequence and dynamic field rendering.
- Support multi-step forms where each step and its fields are controlled by metadata, allowing easy configuration and extension.
- Handle data at the child component level or aggregate in the parent for processing.